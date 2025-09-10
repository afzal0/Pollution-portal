"use client"

import { useState } from 'react'
import Header from '@/components/Layout/Header'
import Sidebar from '@/components/Layout/Sidebar'
import EnhancedMapView from '@/components/Views/EnhancedMapView'
import DataTable from '@/components/Views/DataTable'
import TimeSeries from '@/components/Views/TimeSeries'
import { Map, Table, LineChart, BarChart3, GitCompare, Menu, X } from 'lucide-react'

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
  const [filters, setFilters] = useState({
    pollutant: 'SO2',
    pollutants: ['SO2'],
    level: 'SA2',
    codes: '',
    state: undefined,
    startDate: '',
    endDate: '',
  })

  const handleDownload = async () => {
    const params = new URLSearchParams({
      pollutant: filters.pollutant,
      level: filters.level,
      format: 'csv',
    })
    
    if (filters.state) params.append('state', filters.state)
    if (filters.codes) params.append('codes', filters.codes)
    if (filters.startDate) params.append('start', filters.startDate)
    if (filters.endDate) params.append('end', filters.endDate)

    const response = await fetch(`/api/pollution?${params.toString()}`)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pollution_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
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
            onDownload={handleDownload}
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
                onDownload={handleDownload}
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
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === 'map' && (
              <EnhancedMapView filters={filters} />
            )}
            
            {activeTab === 'data' && (
              <DataTable filters={filters} />
            )}
            
            {activeTab === 'timeseries' && (
              <TimeSeries filters={filters} />
            )}
            
            {activeTab === 'statistics' && (
              <div className="h-full bg-white rounded-lg shadow-sm p-6">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Statistics View</h3>
                  <p className="text-sm">Statistical analysis and insights coming soon</p>
                </div>
              </div>
            )}
            
            {activeTab === 'compare' && (
              <div className="h-full bg-white rounded-lg shadow-sm p-6">
                <div className="text-center text-gray-500">
                  <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Comparison View</h3>
                  <p className="text-sm">Compare different regions and time periods coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}