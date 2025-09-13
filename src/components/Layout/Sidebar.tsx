"use client"

import { Filter } from 'lucide-react'
import Filters from '@/components/Filters'
import { FiltersState } from '@/components/Filters'

interface SidebarProps {
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
  onPolygonDraw?: () => void
  onShapefileUpload?: () => void
  onCoordinateInput?: () => void
}

export default function Sidebar({ 
  filters, 
  onFiltersChange, 
  onPolygonDraw, 
  onShapefileUpload, 
  onCoordinateInput 
}: SidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5" />
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        </div>
        
        <Filters
          filters={filters}
          onChange={onFiltersChange}
          onPolygonDraw={onPolygonDraw}
          onShapefileUpload={onShapefileUpload}
          onCoordinateInput={onCoordinateInput}
        />
      </div>
    </div>
  )
}
