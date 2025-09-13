import { NextRequest, NextResponse } from 'next/server'
import dayjs from 'dayjs'
import { query as herokuQuery } from '@/lib/herokuDb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const level = (searchParams.get('level') || 'SA2').toUpperCase() as 'SA2' | 'SA3' | 'SA4'
	const pollutants = searchParams.get('pollutants')?.split(',').filter(Boolean) || [searchParams.get('pollutant') || 'AER_AI']
	const states = searchParams.get('states')?.split(',').filter(Boolean) || (searchParams.get('state') ? [searchParams.get('state')!] : [])
	const saCodes = searchParams.get('codes')?.split(',').filter(Boolean)
	const start = searchParams.get('start') || undefined
	const end = searchParams.get('end') || undefined
	const aggregation = searchParams.get('aggregation') || 'daily'
	const format = (searchParams.get('format') || 'json').toLowerCase()

	let startDate = start ? dayjs(start).format('YYYY-MM-DD') : undefined
	let endDate = end ? dayjs(end).format('YYYY-MM-DD') : undefined

	const table = level === 'SA2' ? 'pollution_daily' : level === 'SA3' ? 'pollution_daily_sa3' : 'pollution_daily_sa4'
	const whereClauses: string[] = ['pollutant = ANY($1)']
	const params: any[] = [pollutants]
	let idx = params.length
	
	if (states.length > 0) { 
		whereClauses.push(`ste_name = ANY($${++idx})`); 
		params.push(states) 
	}
	
	if (saCodes && saCodes.length > 0) {
		const column = level === 'SA2' ? 'sa2_code' : level === 'SA3' ? 'sa3_code' : 'sa4_code'
		whereClauses.push(`${column} = ANY($${++idx})`); 
		params.push(saCodes)
	}
	
	if (startDate) { 
		whereClauses.push(`date >= $${++idx}`); 
		params.push(startDate) 
	}
	
	if (endDate) { 
		whereClauses.push(`date <= $${++idx}`); 
		params.push(endDate) 
	}

	// If no explicit date range provided, default to the latest full month for these pollutants (and optional states)
	if (!startDate && !endDate) {
		let latestWhere = 'pollutant = ANY($1)'
		const latestParams: any[] = [pollutants]
		if (states.length > 0) { 
			latestWhere += ` AND ste_name = ANY($2)`; 
			latestParams.push(states) 
		}
		const latestSql = `SELECT MAX(date) as latest_date FROM pollution_daily WHERE ${latestWhere}`
		const { rows: latestRows } = await herokuQuery(latestSql, latestParams)
		const latestDateVal = latestRows?.[0]?.latest_date ? dayjs(latestRows[0].latest_date) : undefined
		if (latestDateVal) {
			const monthStart = latestDateVal.startOf('month').format('YYYY-MM-DD')
			const monthEnd = latestDateVal.endOf('month').format('YYYY-MM-DD')
			whereClauses.push(`date >= $${++idx}`); params.push(monthStart)
			whereClauses.push(`date <= $${++idx}`); params.push(monthEnd)
		}
	}

	// Build aggregation query based on aggregation type
	let sql: string
	let groupByClause = ''
	let orderByClause = 'ORDER BY date DESC'
	
	if (aggregation === 'daily') {
		sql = `SELECT pollutant, date, ste_name, sa2_code, sa2_name, centroid_lat, centroid_lon, value 
			FROM ${table} 
			WHERE ${whereClauses.join(' AND ')} 
			ORDER BY date DESC 
			LIMIT 50000`
	} else {
		// For aggregated data, we need to group by different time periods
		let dateTrunc = ''
		let dateField = 'date'
		switch (aggregation) {
			case 'weekly':
				dateTrunc = "DATE_TRUNC('week', date) as period"
				dateField = 'period'
				groupByClause = 'GROUP BY pollutant, DATE_TRUNC(\'week\', date), ste_name, sa2_code, sa2_name'
				orderByClause = 'ORDER BY period DESC'
				break
			case 'monthly':
				dateTrunc = "DATE_TRUNC('month', date) as period"
				dateField = 'period'
				groupByClause = 'GROUP BY pollutant, DATE_TRUNC(\'month\', date), ste_name, sa2_code, sa2_name'
				orderByClause = 'ORDER BY period DESC'
				break
			case 'quarterly':
				dateTrunc = "DATE_TRUNC('quarter', date) as period"
				dateField = 'period'
				groupByClause = 'GROUP BY pollutant, DATE_TRUNC(\'quarter\', date), ste_name, sa2_code, sa2_name'
				orderByClause = 'ORDER BY period DESC'
				break
			case 'yearly':
				dateTrunc = "DATE_TRUNC('year', date) as period"
				dateField = 'period'
				groupByClause = 'GROUP BY pollutant, DATE_TRUNC(\'year\', date), ste_name, sa2_code, sa2_name'
				orderByClause = 'ORDER BY period DESC'
				break
			case 'seasonal':
				dateTrunc = `CASE 
					WHEN EXTRACT(MONTH FROM date) IN (12, 1, 2) THEN 'Summer'
					WHEN EXTRACT(MONTH FROM date) IN (3, 4, 5) THEN 'Autumn'
					WHEN EXTRACT(MONTH FROM date) IN (6, 7, 8) THEN 'Winter'
					WHEN EXTRACT(MONTH FROM date) IN (9, 10, 11) THEN 'Spring'
				END as period, EXTRACT(YEAR FROM date) as year`
				dateField = 'period'
				groupByClause = `GROUP BY pollutant, 
					CASE 
						WHEN EXTRACT(MONTH FROM date) IN (12, 1, 2) THEN 'Summer'
						WHEN EXTRACT(MONTH FROM date) IN (3, 4, 5) THEN 'Autumn'
						WHEN EXTRACT(MONTH FROM date) IN (6, 7, 8) THEN 'Winter'
						WHEN EXTRACT(MONTH FROM date) IN (9, 10, 11) THEN 'Spring'
					END, EXTRACT(YEAR FROM date), ste_name, sa2_code, sa2_name`
				orderByClause = 'ORDER BY year DESC, period'
				break
		}
		
		sql = `SELECT pollutant, ${dateTrunc}, ste_name, sa2_code, sa2_name, 
			AVG(centroid_lat) as centroid_lat, AVG(centroid_lon) as centroid_lon, 
			AVG(value) as value, COUNT(*) as record_count
			FROM ${table} 
			WHERE ${whereClauses.join(' AND ')} 
			${groupByClause}
			${orderByClause}
			LIMIT 50000`
	}
	
	const { rows } = await herokuQuery(sql, params)

	if (format === 'csv') {
		const columns = rows.length ? Object.keys(rows[0]) : ['pollutant','date','ste_name','sa2_code','sa2_name','centroid_lat','centroid_lon','value']
		const esc = (v: any) => v === null || v === undefined ? '' : (typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g,'""')}"` : String(v))
		const csv = [columns.join(',')].concat(rows.map(r => columns.map(c => esc((r as any)[c])).join(','))).join('\n')
		return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="pollution.csv"' } })
	}

	return NextResponse.json({ data: rows })
}
