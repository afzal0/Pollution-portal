import { NextRequest, NextResponse } from 'next/server'
import { query as herokuQuery } from '@/lib/herokuDb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const level = (searchParams.get('level') || 'SA2').toUpperCase() as 'SA2' | 'SA3' | 'SA4'
    
    const table = level === 'SA2' ? 'pollution_daily' : level === 'SA3' ? 'pollution_daily_sa3' : 'pollution_daily_sa4'
    
    // Get distinct states from the database
    const sql = `SELECT DISTINCT ste_name FROM ${table} WHERE ste_name IS NOT NULL ORDER BY ste_name`
    const { rows } = await herokuQuery<{ ste_name: string }>(sql)
    
    const states = rows.map(row => row.ste_name)
    
    return NextResponse.json({
      success: true,
      data: states,
      count: states.length
    })
  } catch (error) {
    console.error('Error fetching states:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch states' },
      { status: 500 }
    )
  }
}
