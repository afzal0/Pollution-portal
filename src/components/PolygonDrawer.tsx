"use client"

import { useEffect, useRef, useState } from 'react'
import { Map, MapRef } from 'maplibre-gl'
import { X, Check, RotateCcw } from 'lucide-react'

interface PolygonDrawerProps {
  map: Map | null
  onPolygonComplete: (coordinates: number[][]) => void
  onCancel: () => void
  isActive: boolean
}

export default function PolygonDrawer({ map, onPolygonComplete, onCancel, isActive }: PolygonDrawerProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<number[][]>([])
  const [currentPolygon, setCurrentPolygon] = useState<any>(null)
  const mapRef = useRef<MapRef>(null)

  useEffect(() => {
    if (!map || !isActive) return

    const handleClick = (e: any) => {
      if (!isDrawing) return

      const { lng, lat } = e.lngLat
      const newPoints = [...points, [lng, lat]]
      setPoints(newPoints)

      // Update the polygon on the map
      updatePolygonOnMap(newPoints)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDrawing()
      } else if (e.key === 'Enter' && isDrawing && points.length >= 3) {
        completePolygon()
      }
    }

    map.on('click', handleClick)
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      map.off('click', handleClick)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [map, isActive, isDrawing, points])

  const startDrawing = () => {
    setIsDrawing(true)
    setPoints([])
    setCurrentPolygon(null)
  }

  const cancelDrawing = () => {
    setIsDrawing(false)
    setPoints([])
    if (currentPolygon) {
      map?.removeLayer('draw-polygon')
      map?.removeSource('draw-polygon')
    }
    setCurrentPolygon(null)
    onCancel()
  }

  const completePolygon = () => {
    if (points.length >= 3) {
      onPolygonComplete(points)
      cancelDrawing()
    }
  }

  const updatePolygonOnMap = (newPoints: number[][]) => {
    if (!map) return

    // Remove existing polygon
    if (map.getLayer('draw-polygon')) {
      map.removeLayer('draw-polygon')
    }
    if (map.getSource('draw-polygon')) {
      map.removeSource('draw-polygon')
    }

    if (newPoints.length < 2) return

    // Create polygon feature
    const polygonFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [newPoints.length >= 3 ? [...newPoints, newPoints[0]] : newPoints]
      },
      properties: {}
    }

    // Add source and layer
    map.addSource('draw-polygon', {
      type: 'geojson',
      data: polygonFeature
    })

    map.addLayer({
      id: 'draw-polygon',
      type: 'fill',
      source: 'draw-polygon',
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.3
      }
    })

    map.addLayer({
      id: 'draw-polygon-outline',
      type: 'line',
      source: 'draw-polygon',
      paint: {
        'line-color': '#1d4ed8',
        'line-width': 2
      }
    })

    setCurrentPolygon(polygonFeature)
  }

  if (!isActive) return null

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">Draw Polygon</h3>
        <button
          onClick={cancelDrawing}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isDrawing ? (
        <button
          onClick={startDrawing}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Start Drawing
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Click on the map to add points. Press Enter to complete or Escape to cancel.
          </p>
          <p className="text-xs text-gray-500">
            Points: {points.length} (minimum 3 required)
          </p>
          <div className="flex gap-2">
            <button
              onClick={completePolygon}
              disabled={points.length < 3}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              Complete
            </button>
            <button
              onClick={cancelDrawing}
              className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
