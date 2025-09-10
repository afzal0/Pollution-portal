"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { LngLatBoundsLike, Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers, Palette, MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { COLOR_SCALES, MAP_STYLES } from '@/lib/constants'

interface EnhancedMapViewProps {
  filters: any
}

export default function EnhancedMapView({ filters }: EnhancedMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const [ready, setReady] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mapStyle, setMapStyle] = useState('light')
  const [showLegend, setShowLegend] = useState(true)
  const [visualization, setVisualization] = useState<'points' | 'heatmap' | 'clusters'>('points')

  useEffect(() => {
    async function fetchData() {
      if (!filters) return

      setLoading(true)
      try {
        const params = new URLSearchParams({
          pollutant: filters.pollutant || 'SO2',
          level: filters.level || 'SA2',
        })
        
        if (filters.state) params.append('state', filters.state)
        if (filters.codes) params.append('codes', filters.codes)
        if (filters.startDate) params.append('start', filters.startDate)
        if (filters.endDate) params.append('end', filters.endDate)

        const response = await fetch(`/api/pollution?${params.toString()}`)
        const result = await response.json()
        setData(result.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
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
        id: index,
        code: row.sa2_code,
        value: row.value,
        name: row.sa2_name,
        state: row.ste_name,
        date: row.date,
        pollutant: row.pollutant,
      },
      geometry: {
        type: 'Point',
        coordinates: [row.centroid_lon || 0, row.centroid_lat || 0]
      }
    }))
  }), [data])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLES.find(s => s.value === mapStyle)?.url || MAP_STYLES[0].url,
      center: [134.5, -25.0],
      zoom: 4,
      attributionControl: true
    })

    mapRef.current = map

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl(), 'bottom-right')

    map.on('load', () => setReady(true))

    return () => map.remove()
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    // Update map style
    const styleUrl = MAP_STYLES.find(s => s.value === mapStyle)?.url
    if (styleUrl && map.getStyle().name !== mapStyle) {
      map.setStyle(styleUrl)
      map.once('styledata', () => {
        // Re-add sources and layers after style change
        addDataLayers()
      })
    } else {
      addDataLayers()
    }

    function addDataLayers() {
      // Remove existing layers and sources
      if (map.getLayer('pollution-heatmap')) map.removeLayer('pollution-heatmap')
      if (map.getLayer('pollution-circles')) map.removeLayer('pollution-circles')
      if (map.getLayer('pollution-clusters')) map.removeLayer('pollution-clusters')
      if (map.getLayer('pollution-cluster-count')) map.removeLayer('pollution-cluster-count')
      if (map.getSource('pollution-data')) map.removeSource('pollution-data')

      if (geojson.features.length === 0) return

      // Add source
      map.addSource('pollution-data', {
        type: 'geojson',
        data: geojson,
        cluster: visualization === 'clusters',
        clusterMaxZoom: 14,
        clusterRadius: 50
      })

      if (visualization === 'heatmap') {
        // Heatmap layer
        map.addLayer({
          id: 'pollution-heatmap',
          type: 'heatmap',
          source: 'pollution-data',
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              0, 0,
              4, 1
            ],
            'heatmap-intensity': {
              stops: [
                [11, 1],
                [15, 3]
              ]
            },
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': {
              stops: [
                [11, 15],
                [15, 20]
              ]
            },
            'heatmap-opacity': 0.8
          }
        })
      } else if (visualization === 'clusters') {
        // Clusters layer
        map.addLayer({
          id: 'pollution-clusters',
          type: 'circle',
          source: 'pollution-data',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              10, '#f1f075',
              30, '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20, 10,
              30, 30,
              40
            ]
          }
        })

        map.addLayer({
          id: 'pollution-cluster-count',
          type: 'symbol',
          source: 'pollution-data',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          },
          paint: {
            'text-color': '#ffffff'
          }
        })

        // Unclustered points
        map.addLayer({
          id: 'pollution-circles',
          type: 'circle',
          source: 'pollution-data',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              ...COLOR_SCALES.pollution.flatMap(s => [s.value, s.color])
            ],
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.9
          }
        })
      } else {
        // Points visualization
        map.addLayer({
          id: 'pollution-circles',
          type: 'circle',
          source: 'pollution-data',
          paint: {
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              ...COLOR_SCALES.pollution.flatMap(s => [s.value, s.color])
            ],
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              -2, 4,
              4, 14
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.8
          }
        })
      }

      // Add interactivity
      const interactiveLayer = visualization === 'clusters' ? 'pollution-circles' : 'pollution-circles'
      
      map.on('mouseenter', interactiveLayer, () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', interactiveLayer, () => {
        map.getCanvas().style.cursor = ''
      })

      map.on('click', interactiveLayer, (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0]
          const props = feature.properties
          
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3 min-w-[200px]">
                <h3 class="font-semibold text-gray-900 mb-2">${props.name}</h3>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">State:</span>
                    <span class="font-medium">${props.state}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">SA2 Code:</span>
                    <span class="font-medium">${props.code}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pollutant:</span>
                    <span class="font-medium">${props.pollutant}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Value:</span>
                    <span class="font-medium">${props.value?.toFixed(6)}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Date:</span>
                    <span class="font-medium">${new Date(props.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            `)
            .addTo(map)
        }
      })

      // Fit bounds if we have data
      if (geojson.features.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        geojson.features.forEach(feature => {
          if (feature.geometry.type === 'Point') {
            bounds.extend(feature.geometry.coordinates as [number, number])
          }
        })
        map.fitBounds(bounds, { padding: 50, maxZoom: 10 })
      }
    }
  }, [ready, geojson, mapStyle, visualization])

  return (
    <div className="h-full relative bg-gray-100 rounded-lg overflow-hidden">
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute top-4 left-4 space-y-3">
        {/* Visualization Type */}
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col gap-1">
            {[
              { value: 'points', label: 'Points', icon: MapPin },
              { value: 'heatmap', label: 'Heatmap', icon: Palette },
              { value: 'clusters', label: 'Clusters', icon: Layers },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setVisualization(value as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  visualization === value
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Style */}
        <div className="bg-white rounded-lg shadow-lg p-2">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="text-sm px-2 py-1 bg-transparent focus:outline-none"
          >
            {MAP_STYLES.filter(s => s.value !== 'satellite').map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      {showLegend && visualization === 'points' && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Pollution Level</h4>
          <div className="space-y-1">
            {COLOR_SCALES.pollution.map(scale => (
              <div key={scale.value} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: scale.color }}
                />
                <span className="text-xs text-gray-600">{scale.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Loading data...</span>
          </div>
        </div>
      )}

      {/* Data Count */}
      {!loading && data.length > 0 && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg">
          <span className="text-sm text-gray-600">
            {data.length} locations
          </span>
        </div>
      )}
    </div>
  )
}
