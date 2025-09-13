import { NextRequest, NextResponse } from 'next/server'
import { query as herokuQuery } from '@/lib/herokuDb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const level = (searchParams.get('level') || 'SA2').toUpperCase() as 'SA2' | 'SA3' | 'SA4'
    const pollutants = searchParams.get('pollutants')?.split(',').filter(Boolean) || [searchParams.get('pollutant') || 'AER_AI']
    const states = searchParams.get('states')?.split(',').filter(Boolean) || (searchParams.get('state') ? [searchParams.get('state')!] : [])

    const table = level === 'SA2' ? 'pollution_daily' : level === 'SA3' ? 'pollution_daily_sa3' : 'pollution_daily_sa4'

    const whereClauses: string[] = ['pollutant = ANY($1)']
    const params: any[] = [pollutants]
    let idx = 1

    if (states.length > 0) {
      whereClauses.push(`ste_name = ANY($${++idx})`)
      params.push(states)
    }

    const sql = `SELECT MIN(date) as min_date, MAX(date) as max_date FROM ${table} WHERE ${whereClauses.join(' AND ')}`
    const { rows } = await herokuQuery<{ min_date: string; max_date: string }>(sql)

    return NextResponse.json({
      success: true,
      data: {
        minDate: rows[0]?.min_date || null,
        maxDate: rows[0]?.max_date || null
      }
    })
  } catch (error) {
    console.error('Error fetching date range:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch date range: ${error}` },
      { status: 500 }
    )
  }
}
