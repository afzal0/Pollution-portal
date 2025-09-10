"use client"

import { useState, useEffect } from 'react'
import { Calendar, ChevronDown, ChevronUp, Filter, MapPin, Search, X, Layers, Download } from 'lucide-react'
import { POLLUTANTS, STATES, SA_LEVELS } from '@/lib/constants'
import dayjs from 'dayjs'

interface SidebarProps {
  filters: any
  onFiltersChange: (filters: any) => void
  onDownload: () => void
}

export default function Sidebar({ filters, onFiltersChange, onDownload }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState({
    pollutants: true,
    location: true,
    date: true,
    level: true,
  })

  const [selectedPollutants, setSelectedPollutants] = useState<string[]>([filters.pollutant])
  const [selectedState, setSelectedState] = useState(filters.state || 'all')
  const [selectedLevel, setSelectedLevel] = useState(filters.level || 'SA2')
  const [startDate, setStartDate] = useState(filters.startDate || '')
  const [endDate, setEndDate] = useState(filters.endDate || '')
  const [searchCode, setSearchCode] = useState(filters.codes || '')

  useEffect(() => {
    onFiltersChange({
      pollutants: selectedPollutants,
      pollutant: selectedPollutants[0], // For backward compatibility
      state: selectedState === 'all' ? undefined : selectedState,
      level: selectedLevel,
      startDate,
      endDate,
      codes: searchCode,
    })
  }, [selectedPollutants, selectedState, selectedLevel, startDate, endDate, searchCode])

  const togglePollutant = (value: string) => {
    setSelectedPollutants(prev => 
      prev.includes(value) 
        ? prev.filter(p => p !== value)
        : [...prev, value]
    )
  }

  const clearFilters = () => {
    setSelectedPollutants(['SO2'])
    setSelectedState('all')
    setSelectedLevel('SA2')
    setStartDate('')
    setEndDate('')
    setSearchCode('')
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search SA Code
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="e.g., 101051539"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchCode && (
              <button
                onClick={() => setSearchCode('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Pollutants */}
        <div className="mb-6">
          <button
            onClick={() => setIsExpanded(prev => ({ ...prev, pollutants: !prev.pollutants }))}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-3"
          >
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-400 to-red-500" />
              Pollutants
            </span>
            {isExpanded.pollutants ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isExpanded.pollutants && (
            <div className="space-y-2">
              {POLLUTANTS.map(pollutant => (
                <label
                  key={pollutant.value}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPollutants.includes(pollutant.value)}
                    onChange={() => togglePollutant(pollutant.value)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pollutant.color }}
                    />
                    <span className="text-sm text-gray-700">{pollutant.label}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mb-6">
          <button
            onClick={() => setIsExpanded(prev => ({ ...prev, location: !prev.location }))}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-3"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </span>
            {isExpanded.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isExpanded.location && (
            <div className="space-y-3">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATES.map(state => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Statistical Level */}
        <div className="mb-6">
          <button
            onClick={() => setIsExpanded(prev => ({ ...prev, level: !prev.level }))}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-3"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Statistical Level
            </span>
            {isExpanded.level ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isExpanded.level && (
            <div className="space-y-2">
              {SA_LEVELS.map(level => (
                <label
                  key={level.value}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="level"
                    value={level.value}
                    checked={selectedLevel === level.value}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <button
            onClick={() => setIsExpanded(prev => ({ ...prev, date: !prev.date }))}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-3"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </span>
            {isExpanded.date ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isExpanded.date && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          Download Data
        </button>
      </div>
    </div>
  )
}
