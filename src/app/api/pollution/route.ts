import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import dayjs from 'dayjs'
import Papa from 'papaparse'

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

	let viewName = 'pollution_daily_sa2'
	if (level === 'SA3') viewName = 'pollution_daily_sa3'
	if (level === 'SA4') viewName = 'pollution_daily_sa4'

	let query = supabase.from(viewName).select('*').eq('pollutant', pollutant)
	if (state) query = query.eq('ste_name', state)
	if (saCodes && saCodes.length > 0) {
		const column = level === 'SA2' ? 'sa2_code' : level === 'SA3' ? 'sa3_code' : 'sa4_code'
		query = query.in(column, saCodes)
	}
	if (startDate) query = query.gte('date', startDate)
	if (endDate) query = query.lte('date', endDate)
	query = query.order('date', { ascending: true })

	const { data, error } = await query
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}

	if (format === 'csv') {
		const csv = Papa.unparse(data || [])
		return new NextResponse(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': 'attachment; filename="pollution.csv"'
			}
		})
	}

	return NextResponse.json({ data })
}
