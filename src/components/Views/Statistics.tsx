"use client"

import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Target, Calendar, MapPin, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { POLLUTANTS } from '@/lib/constants'
import dayjs from 'dayjs'
import LoadingBar from '@/components/LoadingBar'

interface StatisticsProps {
  filters: any
}

export default function Statistics({ filters }: StatisticsProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
    currentPollutant: '',
    isLoading: false
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    setLoadingProgress({
      current: 0,
      total: 0,
      currentPollutant: '',
      isLoading: true
    })
    
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
      
      if (result.data) {
        setData(result.data)
        setLoadingProgress(prev => ({
          ...prev,
          total: result.data.length,
          current: result.data.length,
          currentPollutant: pollutants.join(', ')
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setLoadingProgress(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Process data for different visualizations
  const processedData = useMemo(() => {
    if (!data.length) return { pollutantStats: [], stateStats: [], timeStats: [], spatialStats: [] }

    // Pollutant statistics
    const pollutantStats = data.reduce((acc: any, row: any) => {
      const pollutant = row.pollutant
      if (!acc[pollutant]) {
        acc[pollutant] = {
          pollutant,
          count: 0,
          sum: 0,
          values: [],
          states: new Set(),
          dates: new Set()
        }
      }
      acc[pollutant].count++
      acc[pollutant].sum += row.value
      acc[pollutant].values.push(row.value)
      acc[pollutant].states.add(row.ste_name)
      acc[pollutant].dates.add(row.date || row.period)
      return acc
    }, {})

    const pollutantArray = Object.values(pollutantStats).map((stat: any) => ({
      ...stat,
      mean: stat.sum / stat.count,
      min: Math.min(...stat.values),
      max: Math.max(...stat.values),
      std: Math.sqrt(stat.values.reduce((sum: number, val: number) => sum + Math.pow(val - (stat.sum / stat.count), 2), 0) / stat.count),
      stateCount: stat.states.size,
      dateCount: stat.dates.size
    }))

    // State statistics
    const stateStats = data.reduce((acc: any, row: any) => {
      const state = row.ste_name
      if (!acc[state]) {
        acc[state] = {
          state,
          count: 0,
          sum: 0,
          values: [],
          pollutants: new Set()
        }
      }
      acc[state].count++
      acc[state].sum += row.value
      acc[state].values.push(row.value)
      acc[state].pollutants.add(row.pollutant)
      return acc
    }, {})

    const stateArray = Object.values(stateStats).map((stat: any) => ({
      ...stat,
      mean: stat.sum / stat.count,
      min: Math.min(...stat.values),
      max: Math.max(...stat.values),
      pollutantCount: stat.pollutants.size
    }))

    // Time series statistics
    const timeStats = data.reduce((acc: any, row: any) => {
      const date = dayjs(row.date || row.period).format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          sum: 0,
          values: []
        }
      }
      acc[date].count++
      acc[date].sum += row.value
      acc[date].values.push(row.value)
      return acc
    }, {})

    const timeArray = Object.values(timeStats).map((stat: any) => ({
      ...stat,
      mean: stat.sum / stat.count,
      min: Math.min(...stat.values),
      max: Math.max(...stat.values)
    })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Spatial statistics (by SA2 code)
    const spatialStats = data.reduce((acc: any, row: any) => {
      const code = row.sa2_code || row.sa3_code || row.sa4_code
      if (!acc[code]) {
        acc[code] = {
          code,
          name: row.sa2_name || row.sa3_name || row.sa4_name,
          lat: row.centroid_lat,
          lon: row.centroid_lon,
          count: 0,
          sum: 0,
          values: [],
          pollutants: new Set()
        }
      }
      acc[code].count++
      acc[code].sum += row.value
      acc[code].values.push(row.value)
      acc[code].pollutants.add(row.pollutant)
      return acc
    }, {})

    const spatialArray = Object.values(spatialStats).map((stat: any) => ({
      ...stat,
      mean: stat.sum / stat.count,
      min: Math.min(...stat.values),
      max: Math.max(...stat.values),
      pollutantCount: stat.pollutants.size
    }))

    return {
      pollutantStats: pollutantArray,
      stateStats: stateArray,
      timeStats: timeArray,
      spatialStats: spatialArray
    }
  }, [data])

  const getPollutantColor = (pollutant: string) => {
    return POLLUTANTS.find(p => p.value === pollutant)?.color || '#666'
  }

  const getStateColor = (index: number) => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00']
    return colors[index % colors.length]
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Loading Bar */}
      <LoadingBar
        isLoading={loadingProgress.isLoading}
        current={loadingProgress.current}
        total={loadingProgress.total}
        currentPollutant={loadingProgress.currentPollutant}
        message="Loading statistics..."
      />

      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Statistics Dashboard
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive analysis of pollution data with {data.length.toLocaleString()} records
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading statistics...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-lg font-medium">No Data Available</p>
            <p className="text-sm">Adjust your filters to see statistics</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Records</p>
                  <p className="text-2xl font-bold text-blue-900">{data.length.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Pollutants</p>
                  <p className="text-2xl font-bold text-green-900">
                    {processedData.pollutantStats.length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">States</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {processedData.stateStats.length}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Date Range</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {processedData.timeStats.length}
                  </p>
                  <p className="text-xs text-orange-600">days</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Pollutant Analysis */}
          {processedData.pollutantStats.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Pollutant Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData.pollutantStats.map(stat => ({
                        name: POLLUTANTS.find(p => p.value === stat.pollutant)?.label || stat.pollutant,
                        value: stat.count,
                        color: getPollutantColor(stat.pollutant)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {processedData.pollutantStats.map((stat, index) => (
                        <Cell key={`cell-${index}`} fill={getPollutantColor(stat.pollutant)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pollutant Statistics
                </h3>
                <div className="space-y-3">
                  {processedData.pollutantStats.map((stat, index) => (
                    <div key={stat.pollutant} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {POLLUTANTS.find(p => p.value === stat.pollutant)?.label || stat.pollutant}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getPollutantColor(stat.pollutant) }}
                          />
                          <span className="text-sm text-gray-600">{stat.count} records</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mean:</span>
                          <span className="font-medium">{stat.mean.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-medium">{stat.min.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-medium">{stat.max.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Std Dev:</span>
                          <span className="font-medium">{stat.std.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* State Analysis */}
          {processedData.stateStats.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                State-wise Analysis
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processedData.stateStats.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="state" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value?.toFixed(4), name]}
                    labelFormatter={(label) => `State: ${label}`}
                  />
                  <Bar 
                    dataKey="mean" 
                    fill="#8884d8"
                    name="Average Value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Time Series Analysis */}
          {processedData.timeStats.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Temporal Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={processedData.timeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => dayjs(date).format('MMM DD')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => dayjs(date).format('MMM DD, YYYY')}
                    formatter={(value, name) => [value?.toFixed(4), name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="mean"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Average Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Spatial Analysis */}
          {processedData.spatialStats.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Spatial Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedData.spatialStats.slice(0, 9).map((stat, index) => (
                  <div key={stat.code} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{stat.name}</h4>
                      <span className="text-xs text-gray-500">{stat.code}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Records:</span>
                        <span className="font-medium">{stat.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mean:</span>
                        <span className="font-medium">{stat.mean.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Range:</span>
                        <span className="font-medium">{stat.min.toFixed(2)} - {stat.max.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}