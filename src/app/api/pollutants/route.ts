import { NextRequest, NextResponse } from 'next/server'
import { query as herokuQuery } from '@/lib/herokuDb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const level = (searchParams.get('level') || 'SA2').toUpperCase() as 'SA2' | 'SA3' | 'SA4'
    
    const table = level === 'SA2' ? 'pollution_daily' : level === 'SA3' ? 'pollution_daily_sa3' : 'pollution_daily_sa4'
    
    // Get distinct pollutants from the database
    const sql = `SELECT DISTINCT pollutant FROM ${table} ORDER BY pollutant`
    const { rows } = await herokuQuery<{ pollutant: string }>(sql)
    
    const pollutants = rows.map(row => row.pollutant)
    
    return NextResponse.json({
      success: true,
      data: pollutants,
      count: pollutants.length
    })
  } catch (error) {
    console.error('Error fetching pollutants:', error)
    return NextResponse.json(
      { success: false, error: `Failed to fetch pollutants: ${error}` },
      { status: 500 }
    )
  }
}
