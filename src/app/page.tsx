"use client"

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import Sidebar from '@/components/Layout/Sidebar'
import EnhancedMapView from '@/components/Views/EnhancedMapView'
import DataTable from '@/components/Views/DataTable'
import TimeSeries from '@/components/Views/TimeSeries'
import Statistics from '@/components/Views/Statistics'
import Compare from '@/components/Views/Compare'
import PolygonDrawer from '@/components/PolygonDrawer'
import ShapefileUploader from '@/components/ShapefileUploader'
import CoordinateInput from '@/components/CoordinateInput'
import { Map, Table, LineChart, BarChart3, GitCompare, Menu, X } from 'lucide-react'
import { FiltersState } from '@/components/Filters'

const TABS = [
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'data', label: 'Data Table', icon: Table },
  { id: 'timeseries', label: 'Time Series', icon: LineChart },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'compare', label: 'Compare', icon: GitCompare },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('map')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [filters, setFilters] = useState<FiltersState>({
    pollutants: ['AER_AI'],
    states: [],
    level: 'SA2',
    codes: '',
    customArea: 'none',
    aggregation: 'daily'
  })
  const [mapRef, setMapRef] = useState<any>(null)
  const [showPolygonDrawer, setShowPolygonDrawer] = useState(false)
  const [showShapefileUploader, setShowShapefileUploader] = useState(false)
  const [showCoordinateInput, setShowCoordinateInput] = useState(false)

  const handlePolygonComplete = (coordinates: number[][]) => {
    setFilters(prev => ({
      ...prev,
      polygon: coordinates,
      customArea: 'polygon'
    }))
    setShowPolygonDrawer(false)
  }

  const handleCoordinateSubmit = (coordinates: number[][]) => {
    setFilters(prev => ({
      ...prev,
      polygon: coordinates,
      customArea: 'coordinates'
    }))
    setShowCoordinateInput(false)
  }

  const handleShapefileUpload = (geojson: any) => {
    // Process shapefile and set polygon
    setFilters(prev => ({
      ...prev,
      polygon: geojson.coordinates[0], // Extract first polygon from shapefile
      customArea: 'shapefile'
    }))
    setShowShapefileUploader(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
          <Sidebar 
            filters={filters} 
            onFiltersChange={setFilters}
            onPolygonDraw={() => setShowPolygonDrawer(true)}
            onShapefileUpload={() => setShowShapefileUploader(true)}
            onCoordinateInput={() => setShowCoordinateInput(true)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative w-80 bg-white">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar 
                filters={filters} 
                onFiltersChange={setFilters}
                onPolygonDraw={() => setShowPolygonDrawer(true)}
                onShapefileUpload={() => setShowShapefileUploader(true)}
                onCoordinateInput={() => setShowCoordinateInput(true)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-1">
                {/* Desktop Sidebar Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {/* Tab Buttons */}
                <div className="flex items-center">
                  {TABS.map(tab => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden xl:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Pollutant:</span>
                  <span className="font-medium text-gray-900">{filters.pollutant}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Level:</span>
                  <span className="font-medium text-gray-900">{filters.level}</span>
                </div>
                {filters.state && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">State:</span>
                    <span className="font-medium text-gray-900">{filters.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-auto relative">
            {activeTab === 'map' && (
              <>
                <EnhancedMapView 
                  filters={filters} 
                  onMapReady={setMapRef}
                />
                
                {/* Polygon Drawing Tools */}
                {showPolygonDrawer && (
                  <PolygonDrawer
                    map={mapRef}
                    onPolygonComplete={handlePolygonComplete}
                    onCancel={() => setShowPolygonDrawer(false)}
                    isActive={showPolygonDrawer}
                  />
                )}
                
                {showShapefileUploader && (
                  <ShapefileUploader
                    onShapefileUpload={handleShapefileUpload}
                    onCancel={() => setShowShapefileUploader(false)}
                    isActive={showShapefileUploader}
                  />
                )}
                
                {showCoordinateInput && (
                  <CoordinateInput
                    onCoordinatesSubmit={handleCoordinateSubmit}
                    onCancel={() => setShowCoordinateInput(false)}
                    isActive={showCoordinateInput}
                  />
                )}
              </>
            )}
            
            {activeTab === 'data' && (
              <DataTable filters={filters} />
            )}
            
            {activeTab === 'timeseries' && (
              <TimeSeries filters={filters} />
            )}
            
            {activeTab === 'statistics' && (
              <Statistics filters={filters} />
            )}
            
            {activeTab === 'compare' && (
              <Compare filters={filters} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}