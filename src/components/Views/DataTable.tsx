"use client"

import { useState, useEffect, useMemo } from 'react'
import { ArrowUpDown, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { POLLUTANTS } from '@/lib/constants'

interface DataTableProps {
  filters: any
}

export default function DataTable({ filters }: DataTableProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const pollutants = filters.pollutants || [filters.pollutant || 'AER_AI']
      const params = new URLSearchParams({
        pollutants: pollutants.join(','),
        level: filters.level || 'SA2',
        aggregation: filters.aggregation || 'daily'
      })
      
      if (filters.states && filters.states.length > 0) params.append('states', filters.states.join(','))
      if (filters.codes) params.append('codes', filters.codes)
      if (filters.start) params.append('start', filters.start)
      if (filters.end) params.append('end', filters.end)

      const response = await fetch(`/api/pollution?${params.toString()}`)
      const result = await response.json()
      setData(result.data || [])
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedData = useMemo(() => {
    let filtered = data
    
    if (searchTerm) {
      filtered = data.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    return filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (aVal === null) return 1
      if (bVal === null) return -1
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }, [data, searchTerm, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredAndSortedData.slice(start, end)
  }, [filteredAndSortedData, currentPage])

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)

  const downloadCSV = () => {
    const headers = ['SA2 Code', 'SA2 Name', 'State', 'Date', 'Pollutant', 'Value', 'Lat', 'Lon']
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(row =>
        [row.sa2_code, row.sa2_name, row.ste_name, row.date, row.pollutant, row.value, row.centroid_lat, row.centroid_lon]
          .map(val => `"${val}"`)
          .join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pollution_data_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getPollutantColor = (pollutant: string) => {
    const p = POLLUTANTS.find(p => p.value === pollutant)
    return p?.color || '#666'
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Data Table</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Total Records: {filteredAndSortedData.length}</span>
          <span>•</span>
          <span>Showing: {paginatedData.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {['sa2_code', 'sa2_name', 'ste_name', 'date', 'pollutant', 'value', 'centroid_lat', 'centroid_lon'].map(field => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{row.sa2_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.sa2_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.ste_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.date ? new Date(row.date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${getPollutantColor(row.pollutant)}20`,
                        color: getPollutantColor(row.pollutant)
                      }}
                    >
                      {row.pollutant}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.value ? row.value.toFixed(6) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.centroid_lat ? row.centroid_lat.toFixed(4) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.centroid_lon ? row.centroid_lon.toFixed(4) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
