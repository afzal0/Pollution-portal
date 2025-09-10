"use client"

import { Activity, Info, Settings, Menu } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Australia Pollution Portal</h1>
                <p className="text-sm text-blue-100">Real-time environmental monitoring & analysis</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">Live Data</span>
            </div>
            
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
            >
              <Info className="w-5 h-5" />
            </button>
            
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="absolute right-6 top-16 z-50 w-80 bg-white text-gray-800 rounded-lg shadow-xl p-4">
          <h3 className="font-semibold mb-2">About This Portal</h3>
          <p className="text-sm text-gray-600 mb-3">
            Monitor air quality across Australia with real-time pollution data from Sentinel-5P satellite.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>SA2, SA3, SA4 statistical areas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Multiple pollutant tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Historical trend analysis</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
