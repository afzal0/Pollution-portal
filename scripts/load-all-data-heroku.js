const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const { Pool } = require('pg')

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Export your Heroku Postgres URL first.')
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

const stateMap = {
  'ACT-pollution-data': 'Australian Capital Territory',
  'Nsw-pollution-data': 'New South Wales',
  'NT-pollution-data': 'Northern Territory',
  'QLD-pollution-data': 'Queensland',
}

const pollutantMap = {
  'SO2_OFFL': 'SO2',
  'NO2_OFFL': 'NO2',
  'CO_OFFL': 'CO',
  'O3_OFFL': 'O3',
  'HCHO_OFFL': 'HCHO',
  'AER_AI_OFFL': 'AER_AI',
  'AER_LH_OFFL': 'AER_LH',
  'CH4_OFFL': 'CH4',
  'CLOUD_OFFL': 'CLOUD',
  'O3_TCL_OFFL': 'O3_TCL'
}

async function ensureSchema() {
  const client = await pool.connect()
  try {
    await client.query('create extension if not exists pgcrypto;')
    await client.query(`
      create table if not exists public.pollution_daily (
        id uuid primary key default gen_random_uuid(),
        pollutant text,
        date date,
        ste_name text,
        sa2_code text,
        sa2_name text,
        centroid_lat double precision,
        centroid_lon double precision,
        value double precision,
        inserted_at timestamptz default now()
      );
    `)
  } finally {
    client.release()
  }
}

async function insertBatch(client, rows) {
  if (rows.length === 0) return
  const values = []
  const params = []
  let p = 0
  for (const r of rows) {
    values.push(`($${++p},$${++p},$${++p},$${++p},$${++p},$${++p},$${++p},$${++p})`)
    params.push(r.pollutant, r.date, r.ste_name, r.sa2_code, r.sa2_name, r.centroid_lat, r.centroid_lon, r.value)
  }
  const sql = `insert into pollution_daily (pollutant,date,ste_name,sa2_code,sa2_name,centroid_lat,centroid_lon,value) values ${values.join(',')}`
  await client.query(sql, params)
}

async function processFile(client, filePath, stateName, pollutant) {
  return new Promise((resolve, reject) => {
    const rows = []
    let count = 0
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        count++
        if (row.SA2_CODE21 && row.date && row.value) {
          rows.push({
            pollutant,
            date: row.date,
            ste_name: stateName,
            sa2_code: row.SA2_CODE21,
            sa2_name: row.SA2_NAME21 || null,
            centroid_lat: row.centroid_lat ? parseFloat(row.centroid_lat) : null,
            centroid_lon: row.centroid_lon ? parseFloat(row.centroid_lon) : null,
            value: row.value ? parseFloat(row.value) : null,
          })
        }
      })
      .on('end', async () => {
        try {
          for (let i = 0; i < rows.length; i += 1000) {
            await insertBatch(client, rows.slice(i, i + 1000))
          }
          resolve({ inserted: rows.length, scanned: count })
        } catch (e) { reject(e) }
      })
      .on('error', reject)
  })
}

async function run() {
  await ensureSchema()
  const client = await pool.connect()
  try {
    const dataDir = path.join(__dirname, '..', '..', 'Data')
    let files = 0, inserted = 0
    for (const [folder, stateName] of Object.entries(stateMap)) {
      const stateDir = path.join(dataDir, folder)
      if (!fs.existsSync(stateDir)) continue
      const yearFolders = fs.readdirSync(stateDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
      for (const yf of yearFolders) {
        const m = yf.match(/([A-Z_]+)_OFFL$/)
        if (!m) continue
        const pollutant = pollutantMap[m[1]] || m[1]
        const dir = path.join(stateDir, yf)
        const csvFiles = fs.readdirSync(dir).filter(f => f.endsWith('.csv'))
        for (const f of csvFiles) {
          const fp = path.join(dir, f)
          const res = await processFile(client, fp, stateName, pollutant)
          files++
          inserted += res.inserted
          if (files % 100 === 0) console.log(`Processed ${files} files, inserted ${inserted} rows`)
        }
      }
    }
    console.log(`Done. Files: ${files}, Rows: ${inserted}`)
  } finally {
    client.release()
    await pool.end()
  }
}

if (require.main === module) run().catch(err => { console.error(err); process.exit(1) })


