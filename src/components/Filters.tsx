"use client"

import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { Download, MapPin, Upload, Edit3, X } from 'lucide-react'

export type FiltersState = {
  pollutants: string[]
  states: string[]
  level: 'SA2' | 'SA3' | 'SA4'
  codes: string
  start?: string
  end?: string
  polygon?: number[][]
  customArea?: 'none' | 'polygon' | 'shapefile' | 'coordinates'
  aggregation?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'seasonal'
}

interface FiltersProps {
  onChange: (f: FiltersState) => void
  onPolygonDraw?: () => void
  onShapefileUpload?: () => void
  onCoordinateInput?: () => void
}

export default function Filters({ 
  onChange, 
  onPolygonDraw, 
  onShapefileUpload, 
  onCoordinateInput 
}: FiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    pollutants: ['AER_AI'],
    states: [],
    level: 'SA2',
    codes: '',
    customArea: 'none',
    aggregation: 'daily'
  })

  const [availablePollutants, setAvailablePollutants] = useState<string[]>([])
  const [availableStates, setAvailableStates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{ minDate: string | null; maxDate: string | null }>({ minDate: null, maxDate: null })

  // Fetch available pollutants, states, and date range
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch pollutants
        const pollutantsResponse = await fetch(`/api/pollutants?level=${filters.level}`)
        const pollutantsData = await pollutantsResponse.json()
        if (pollutantsData.success) {
          setAvailablePollutants(pollutantsData.data)
        }

        // Fetch states
        const statesResponse = await fetch(`/api/states?level=${filters.level}`)
        const statesData = await statesResponse.json()
        if (statesData.success) {
          setAvailableStates(statesData.data)
        }

        // Fetch date range
        const params = new URLSearchParams({
          level: filters.level,
          pollutants: filters.pollutants.join(',')
        })
        if (filters.states.length > 0) {
          params.append('states', filters.states.join(','))
        }
        
        const dateRangeResponse = await fetch(`/api/date-range?${params.toString()}`)
        const dateRangeData = await dateRangeResponse.json()
        if (dateRangeData.success) {
          setDateRange(dateRangeData.data)
        }
      } catch (error) {
        console.error('Error fetching filter options:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters.level, filters.pollutants, filters.states])

  function update<K extends keyof FiltersState>(key: K, value: FiltersState[K]) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    onChange(next)
  }

  const handlePollutantChange = (pollutant: string, checked: boolean) => {
    if (checked) {
      update('pollutants', [...filters.pollutants, pollutant])
    } else {
      update('pollutants', filters.pollutants.filter(p => p !== pollutant))
    }
  }

  const handleStateChange = (state: string, checked: boolean) => {
    if (checked) {
      update('states', [...filters.states, state])
    } else {
      update('states', filters.states.filter(s => s !== state))
    }
  }

  const clearPolygon = () => {
    update('polygon', undefined)
    update('customArea', 'none')
  }

  const queryString = new URLSearchParams({
    level: filters.level,
    pollutants: filters.pollutants.join(','),
    ...(filters.states.length > 0 ? { states: filters.states.join(',') } : {}),
    ...(filters.codes ? { codes: filters.codes } : {}),
    ...(filters.start ? { start: filters.start } : {}),
    ...(filters.end ? { end: filters.end } : {}),
    format: 'csv'
  }).toString()

  const downloadUrl = `/api/pollution?${queryString}`

  return (
    <div className="space-y-4">
      {/* Pollutant Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pollutants ({filters.pollutants.length} selected)
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
          {loading ? (
            <div className="col-span-2 text-sm text-gray-500">Loading pollutants...</div>
          ) : (
            availablePollutants.map(pollutant => (
              <label key={pollutant} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.pollutants.includes(pollutant)}
                  onChange={(e) => handlePollutantChange(pollutant, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">{pollutant}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* State Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          States ({filters.states.length} selected)
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
          {loading ? (
            <div className="text-sm text-gray-500">Loading states...</div>
          ) : (
            availableStates.map(state => (
              <label key={state} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.states.includes(state)}
                  onChange={(e) => handleStateChange(state, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-700">{state}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Level Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Geographic Level</label>
        <select 
          className="w-full border rounded-md px-3 py-2" 
          value={filters.level}
          onChange={e => update('level', e.target.value as 'SA2' | 'SA3' | 'SA4')}
        >
          <option value="SA2">SA2 (Statistical Area Level 2)</option>
          <option value="SA3">SA3 (Statistical Area Level 3)</option>
          <option value="SA4">SA4 (Statistical Area Level 4)</option>
        </select>
      </div>

      {/* Data Aggregation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Aggregation</label>
        <select 
          className="w-full border rounded-md px-3 py-2" 
          value={filters.aggregation || 'daily'}
          onChange={e => update('aggregation', e.target.value as any)}
        >
          <option value="daily">Daily (Raw Data)</option>
          <option value="weekly">Weekly Average</option>
          <option value="monthly">Monthly Average</option>
          <option value="quarterly">Quarterly Average</option>
          <option value="yearly">Yearly Average</option>
          <option value="seasonal">Seasonal Average</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {filters.aggregation === 'daily' && 'Shows individual daily observations'}
          {filters.aggregation === 'weekly' && 'Averages data by week (Monday-Sunday)'}
          {filters.aggregation === 'monthly' && 'Averages data by calendar month'}
          {filters.aggregation === 'quarterly' && 'Averages data by quarter (Q1-Q4)'}
          {filters.aggregation === 'yearly' && 'Averages data by calendar year'}
          {filters.aggregation === 'seasonal' && 'Averages data by season (Summer, Autumn, Winter, Spring)'}
        </p>
      </div>

      {/* Custom Area Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Area Filter</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPolygonDraw?.()}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-colors ${
              filters.customArea === 'polygon' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Draw Polygon
          </button>
          <button
            onClick={() => onShapefileUpload?.()}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-colors ${
              filters.customArea === 'shapefile' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Shapefile
          </button>
          <button
            onClick={() => onCoordinateInput?.()}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-colors ${
              filters.customArea === 'coordinates' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Enter Coordinates
          </button>
          <button
            onClick={clearPolygon}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            Clear Area
          </button>
        </div>
        {filters.polygon && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Custom polygon active ({filters.polygon.length} points)
            </p>
          </div>
        )}
      </div>

      {/* Codes Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SA Codes (comma separated)
        </label>
        <input 
          className="w-full border rounded-md px-3 py-2" 
          placeholder="e.g., 511041292, 511041293"
          value={filters.codes} 
          onChange={e => update('codes', e.target.value)} 
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input 
            type="date" 
            className="w-full border rounded-md px-3 py-2"
            value={filters.start || ''} 
            onChange={e => update('start', e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input 
            type="date" 
            className="w-full border rounded-md px-3 py-2"
            value={filters.end || ''} 
            onChange={e => update('end', e.target.value)} 
          />
        </div>
      </div>

      {/* Quick Date Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Date Ranges</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All Time', action: 'all' },
            { label: 'Last 7 days', days: 7 },
            { label: 'Last 30 days', days: 30 },
            { label: 'Last 90 days', days: 90 },
            { label: 'Last year', days: 365 }
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                if (preset.action === 'all' && dateRange.minDate && dateRange.maxDate) {
                  update('start', dateRange.minDate)
                  update('end', dateRange.maxDate)
                } else if (preset.days) {
                  const end = dayjs().format('YYYY-MM-DD')
                  const start = dayjs().subtract(preset.days, 'day').format('YYYY-MM-DD')
                  update('start', start)
                  update('end', end)
                }
              }}
              disabled={preset.action === 'all' && (!dateRange.minDate || !dateRange.maxDate)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {preset.label}
            </button>
          ))}
        </div>
        {dateRange.minDate && dateRange.maxDate && (
          <p className="text-xs text-gray-500 mt-2">
            Data available from {dayjs(dateRange.minDate).format('MMM D, YYYY')} to {dayjs(dateRange.maxDate).format('MMM D, YYYY')}
          </p>
        )}
      </div>

      {/* Download Button */}
      <div className="pt-2">
        <a 
          href={downloadUrl} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </a>
      </div>
    </div>
  )
}
