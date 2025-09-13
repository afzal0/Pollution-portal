"use client"

import { useState } from 'react'
import { MapPin, Plus, X, Check } from 'lucide-react'

interface CoordinateInputProps {
  onCoordinatesSubmit: (coordinates: number[][]) => void
  onCancel: () => void
  isActive: boolean
}

export default function CoordinateInput({ onCoordinatesSubmit, onCancel, isActive }: CoordinateInputProps) {
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string }[]>([])
  const [currentLat, setCurrentLat] = useState('')
  const [currentLng, setCurrentLng] = useState('')

  const addCoordinate = () => {
    const lat = parseFloat(currentLat)
    const lng = parseFloat(currentLng)
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude values')
      return
    }
    
    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90')
      return
    }
    
    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180')
      return
    }
    
    setCoordinates([...coordinates, { lat: currentLat, lng: currentLng }])
    setCurrentLat('')
    setCurrentLng('')
  }

  const removeCoordinate = (index: number) => {
    setCoordinates(coordinates.filter((_, i) => i !== index))
  }

  const submitCoordinates = () => {
    if (coordinates.length < 3) {
      alert('Please add at least 3 coordinates to create a polygon')
      return
    }
    
    const coords = coordinates.map(coord => [parseFloat(coord.lng), parseFloat(coord.lat)])
    onCoordinatesSubmit(coords)
  }

  const clearAll = () => {
    setCoordinates([])
    setCurrentLat('')
    setCurrentLng('')
  }

  if (!isActive) return null

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 w-80">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">Enter Coordinates</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Input fields */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g., -37.8136"
              value={currentLat}
              onChange={(e) => setCurrentLat(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g., 144.9631"
              value={currentLng}
              onChange={(e) => setCurrentLng(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={addCoordinate}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Point
        </button>

        {/* Coordinate list */}
        {coordinates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Points ({coordinates.length})
              </h4>
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear All
              </button>
            </div>
            
            <div className="max-h-32 overflow-y-auto space-y-1">
              {coordinates.map((coord, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span className="flex-1">
                    {coord.lat}, {coord.lng}
                  </span>
                  <button
                    onClick={() => removeCoordinate(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={submitCoordinates}
            disabled={coordinates.length < 3}
            className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            Create Polygon
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="text-xs text-gray-500">
          <p>• Enter coordinates in decimal degrees</p>
          <p>• Minimum 3 points required for polygon</p>
          <p>• Latitude: -90 to 90, Longitude: -180 to 180</p>
        </div>
      </div>
    </div>
  )
}
