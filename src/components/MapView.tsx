"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { LngLatBoundsLike, Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { query as herokuQuery } from '@/lib/herokuDb'

export type ChoroplethFeature = {
	code: string
	value: number
	geom: GeoJSON.MultiPolygon | GeoJSON.Polygon
}

export type MapViewProps = {
	features: ChoroplethFeature[]
	bounds?: LngLatBoundsLike
	title?: string
	filters?: {
		pollutant: string
		level: string
		codes: string
	}
}

function getColor(value: number) {
	const stops = [
		{ t: -0.0002, c: '#3b82f6' },
		{ t: -0.00005, c: '#60a5fa' },
		{ t: 0, c: '#e5e7eb' },
		{ t: 0.0001, c: '#fdba74' },
		{ t: 0.0003, c: '#fb923c' },
		{ t: 0.0006, c: '#f97316' },
		{ t: 0.001, c: '#ea580c' }
	]
	for (let i = stops.length - 1; i >= 0; i--) {
		if (value >= stops[i].t) return stops[i].c
	}
	return '#e5e7eb'
}

export default function MapView({ features, bounds, title, filters }: MapViewProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const mapRef = useRef<Map | null>(null)
	const [ready, setReady] = useState(false)
	const [data, setData] = useState<any[]>([])
	const [loading, setLoading] = useState(false)

	// Fetch data from Heroku Postgres
	useEffect(() => {
		async function fetchData() {
			if (!filters) return
			
			setLoading(true)
			try {
				const where = ['pollutant = $1']
				const params: any[] = [filters.pollutant]
				let idx = params.length
				if (filters.codes) {
					const codes = filters.codes.split(',').map(c => c.trim())
					where.push(`sa2_code = ANY($${++idx})`)
					params.push(codes)
				}
				const sql = `select sa2_code, sa2_name, ste_name, value, centroid_lat, centroid_lon from pollution_daily where ${where.join(' AND ')} order by date desc limit 1000`
				const { rows } = await herokuQuery(sql, params)
				setData(rows || [])
			} catch (error) {
				console.error('Error:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [filters])

	const geojson = useMemo<GeoJSON.FeatureCollection>(() => ({
		type: 'FeatureCollection',
		features: data.map((row, index) => ({
			type: 'Feature',
			properties: { 
				code: row.sa2_code, 
				value: row.value,
				name: row.sa2_name,
				state: row.ste_name
			},
			geometry: {
				type: 'Point',
				coordinates: [row.centroid_lon, row.centroid_lat]
			}
		}))
	}), [data])

	useEffect(() => {
		if (!containerRef.current || mapRef.current) return
		const map = new maplibregl.Map({
			container: containerRef.current,
			style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
			center: [134.5, -25.0],
			zoom: 3.2,
			attributionControl: true
		})
		mapRef.current = map
		map.on('load', () => setReady(true))
		return () => map.remove()
	}, [])

	useEffect(() => {
		const map = mapRef.current
		if (!map || !ready) return

		if (map.getSource('pollution-data')) {
			map.removeLayer('pollution-circles')
			map.removeSource('pollution-data')
		}
		
		if (geojson.features.length === 0) return
		
		map.addSource('pollution-data', { type: 'geojson', data: geojson })
		map.addLayer({
			id: 'pollution-circles',
			type: 'circle',
			source: 'pollution-data',
			paint: {
				'circle-color': [
					'interpolate',
					['linear'],
					['get', 'value'],
					-2, '#2166ac',
					-1, '#4393c3',
					0, '#92c5de',
					0.5, '#d1e5f0',
					1, '#f7f7f7',
					1.5, '#fddbc7',
					2, '#f4a582',
					3, '#d6604d',
					4, '#b2182b'
				],
				'circle-radius': [
					'interpolate',
					['linear'],
					['get', 'value'],
					-2, 3,
					4, 12
				],
				'circle-opacity': 0.8
			}
		})

		// Add hover effect
		map.on('mouseenter', 'pollution-circles', () => {
			map.getCanvas().style.cursor = 'pointer'
		})

		map.on('mouseleave', 'pollution-circles', () => {
			map.getCanvas().style.cursor = ''
		})

		// Add popup on click
		map.on('click', 'pollution-circles', (e) => {
			if (e.features && e.features[0]) {
				const feature = e.features[0]
				new maplibregl.Popup()
					.setLngLat(e.lngLat)
					.setHTML(`
						<div class="p-2">
							<h3 class="font-semibold">${feature.properties.name}</h3>
							<p class="text-sm text-gray-600">${feature.properties.state}</p>
							<p class="text-sm">SA2 Code: ${feature.properties.code}</p>
							<p class="text-sm font-medium">Value: ${feature.properties.value.toFixed(6)}</p>
						</div>
					`)
					.addTo(map)
			}
		})

		if (bounds) {
			map.fitBounds(bounds, { padding: 24, duration: 0 })
		}
	}, [ready, geojson, bounds])

	return (
		<div className="w-full h-[70vh] rounded-lg overflow-hidden border border-gray-200 relative">
			{title ? <div className="px-4 py-2 text-sm text-gray-700 bg-white/70 absolute z-10">{title}</div> : null}
			{loading && (
				<div className="absolute top-4 right-4 bg-white px-3 py-2 rounded shadow z-20">
					<div className="text-sm text-gray-600">Loading data...</div>
				</div>
			)}
			{data.length > 0 && !loading && (
				<div className="absolute top-4 left-4 bg-white px-3 py-2 rounded shadow z-20">
					<div className="text-sm text-gray-600">
						Showing {data.length} data points
					</div>
				</div>
			)}
			<div ref={containerRef} className="w-full h-full" />
		</div>
	)
}
