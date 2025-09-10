"use client"

import { useState } from 'react'
import dayjs from 'dayjs'

export type FiltersState = {
	pollutant: string
	state?: string
	level: 'SA2' | 'SA3' | 'SA4'
	codes: string
	start?: string
	end?: string
}

export default function Filters({ onChange }: { onChange: (f: FiltersState) => void }) {
	const [filters, setFilters] = useState<FiltersState>({
		pollutant: 'SO2',
		level: 'SA2',
		codes: ''
	})

	function update<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
		const next = { ...filters, [key]: value }
		setFilters(next)
		onChange(next)
	}

	const queryString = new URLSearchParams({
		level: filters.level,
		pollutant: filters.pollutant,
		...(filters.state ? { state: filters.state } : {}),
		...(filters.codes ? { codes: filters.codes } : {}),
		...(filters.start ? { start: filters.start } : {}),
		...(filters.end ? { end: filters.end } : {}),
		format: 'csv'
	}).toString()

	const downloadUrl = `/api/pollution?${queryString}`

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<div>
				<label className="block text-sm text-gray-600 mb-1">Pollutant</label>
				<select className="w-full border rounded-md px-2 py-2" value={filters.pollutant}
					onChange={e => update('pollutant', e.target.value)}>
					<option>SO2</option>
					<option>NO2</option>
					<option>PM2.5</option>
					<option>PM10</option>
				</select>
			</div>
			<div>
				<label className="block text-sm text-gray-600 mb-1">State (STE_NAME)</label>
				<input className="w-full border rounded-md px-2 py-2" placeholder="Western Australia"
					value={filters.state || ''} onChange={e => update('state', e.target.value)} />
			</div>
			<div>
				<label className="block text-sm text-gray-600 mb-1">Level</label>
				<select className="w-full border rounded-md px-2 py-2" value={filters.level}
					onChange={e => update('level', e.target.value as any)}>
					<option value="SA2">SA2</option>
					<option value="SA3">SA3</option>
					<option value="SA4">SA4</option>
				</select>
			</div>
			<div className="sm:col-span-2">
				<label className="block text-sm text-gray-600 mb-1">Codes (comma separated)</label>
				<input className="w-full border rounded-md px-2 py-2" placeholder="511041292, ..."
					value={filters.codes} onChange={e => update('codes', e.target.value)} />
			</div>
			<div>
				<label className="block text-sm text-gray-600 mb-1">Start date</label>
				<input type="date" className="w-full border rounded-md px-2 py-2"
					value={filters.start || ''} onChange={e => update('start', e.target.value)} />
			</div>
			<div>
				<label className="block text-sm text-gray-600 mb-1">End date</label>
				<input type="date" className="w-full border rounded-md px-2 py-2"
					value={filters.end || ''} onChange={e => update('end', e.target.value)} />
			</div>
			<div className="flex items-end">
				<a href={downloadUrl} className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
					Download CSV
				</a>
			</div>
		</div>
	)
}
