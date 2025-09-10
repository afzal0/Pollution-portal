import { NextRequest, NextResponse } from 'next/server'
import dayjs from 'dayjs'
import { query as herokuQuery } from '@/lib/herokuDb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const level = (searchParams.get('level') || 'SA2').toUpperCase() as 'SA2' | 'SA3' | 'SA4'
	const pollutant = searchParams.get('pollutant') || 'SO2'
	const state = searchParams.get('state') || undefined
	const saCodes = searchParams.get('codes')?.split(',').filter(Boolean)
	const start = searchParams.get('start') || undefined
	const end = searchParams.get('end') || undefined
	const format = (searchParams.get('format') || 'json').toLowerCase()

	const startDate = start ? dayjs(start).format('YYYY-MM-DD') : undefined
	const endDate = end ? dayjs(end).format('YYYY-MM-DD') : undefined

	const table = level === 'SA2' ? 'pollution_daily' : level === 'SA3' ? 'pollution_daily_sa3' : 'pollution_daily_sa4'
	const whereClauses: string[] = ['pollutant = $1']
	const params: any[] = [pollutant]
	let idx = params.length
	if (state) { whereClauses.push(`ste_name = $${++idx}`); params.push(state) }
	if (saCodes && saCodes.length > 0) {
		const column = level === 'SA2' ? 'sa2_code' : level === 'SA3' ? 'sa3_code' : 'sa4_code'
		whereClauses.push(`${column} = ANY($${++idx})`); params.push(saCodes)
	}
	if (startDate) { whereClauses.push(`date >= $${++idx}`); params.push(startDate) }
	if (endDate) { whereClauses.push(`date <= $${++idx}`); params.push(endDate) }

	const sql = `SELECT * FROM ${table} WHERE ${whereClauses.join(' AND ')} ORDER BY date ASC LIMIT 200000`
	const { rows } = await herokuQuery(sql, params)

	if (format === 'csv') {
		const columns = rows.length ? Object.keys(rows[0]) : ['pollutant','date','ste_name','sa2_code','sa2_name','centroid_lat','centroid_lon','value']
		const esc = (v: any) => v === null || v === undefined ? '' : (typeof v === 'string' && (v.includes(',') || v.includes('"')) ? `"${v.replace(/"/g,'""')}"` : String(v))
		const csv = [columns.join(',')].concat(rows.map(r => columns.map(c => esc((r as any)[c])).join(','))).join('\n')
		return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="pollution.csv"' } })
	}

	return NextResponse.json({ data: rows })
}
