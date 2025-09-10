"use client"

import Filters, { FiltersState } from '@/components/Filters'
import MapView, { ChoroplethFeature } from '@/components/MapView'
import { Suspense, useState } from 'react'

export default function Home() {
	const [filters, setFilters] = useState<FiltersState>({
		pollutant: 'SO2',
		level: 'SA2',
		codes: ''
	})

	return (
		<main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Australia Pollution Portal</h1>
				<p className="text-sm text-gray-500">Explore, filter, and download SA2/3/4 data</p>
			</header>
			<Filters onChange={setFilters} />
			<Suspense fallback={<div className="h-[70vh] bg-gray-50 rounded-lg border" />}>
				<MapView features={[]} title="Pollution Data Map" filters={filters} />
			</Suspense>
		</main>
	)
}
