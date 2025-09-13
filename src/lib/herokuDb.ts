import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

// Determine SSL configuration based on connection string and environment
const isHerokuRDS = connectionString?.includes('amazonaws.com') || connectionString?.includes('heroku')
const isLocalDev = process.env.NODE_ENV === 'development' && !isHerokuRDS

// For Heroku/RDS, always use SSL. For local development, disable SSL
const sslConfig = isHerokuRDS ? { rejectUnauthorized: false } : false

export const herokuPool = new Pool({
  connectionString,
  ssl: sslConfig
})

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const client = await herokuPool.connect()
  try {
    const res = await client.query(text, params)
    return { rows: res.rows as T[] }
  } finally {
    client.release()
  }
}

