import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PollutionRow = {
	id: string
	sa_level: 'SA2' | 'SA3' | 'SA4'
	sa_code: string
	state_name: string
	date: string
	pollutant: string
	value: number
	geom?: any
}

export type GeoBoundary = {
	id: string
	level: 'SA2' | 'SA3' | 'SA4'
	code: string
	name: string
	state_name: string
	geom: any
}
