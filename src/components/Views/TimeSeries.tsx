"use client"

import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { POLLUTANTS } from '@/lib/constants'
import dayjs from 'dayjs'

interface TimeSeriesProps {
  filters: any
}

export default function TimeSeries({ filters }: TimeSeriesProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'area'>('line')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const [statistics, setStatistics] = useState({
    mean: 0,
    max: 0,
    min: 0,
    trend: 0,
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch data for all selected pollutants
      const allData: any[] = []
      
      for (const pollutant of filters.pollutants || [filters.pollutant || 'AER_AI']) {
        const params = new URLSearchParams({
          pollutant: pollutant,
          level: filters.level || 'SA2',
        })
        
        if (filters.state) params.append('state', filters.state)
        if (filters.codes) params.append('codes', filters.codes)
        if (filters.startDate) params.append('start', filters.startDate)
        if (filters.endDate) params.append('end', filters.endDate)

        const response = await fetch(`/api/pollution?${params.toString()}`)
        const result = await response.json()
        
        if (result.data) {
          allData.push(...result.data)
        }
      }
      
      // Process data for time series
      const processedData = processTimeSeriesData(allData)
      setData(processedData)
      calculateStatistics(processedData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTimeSeriesData = (rawData: any[]) => {
    // Group by date and calculate average
    const grouped = rawData.reduce((acc, row) => {
      const date = dayjs(row.date).format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = { date, values: [], count: 0 }
      }
      acc[date].values.push(row.value)
      acc[date].count++
      return acc
    }, {} as any)

    // Calculate averages and format for chart
    const processed = Object.values(grouped).map((group: any) => {
      const avg = group.values.reduce((sum: number, val: number) => sum + val, 0) / group.count
      
      // If multiple pollutants selected, add them as separate series
      const result: any = {
        date: group.date,
        value: avg,
        count: group.count,
      }

      // Add pollutant-specific values if multiple selected
      if (filters.pollutants && filters.pollutants.length > 1) {
        filters.pollutants.forEach((pollutant: string) => {
          const pollutantValues = rawData
            .filter(r => r.pollutant === pollutant && dayjs(r.date).format('YYYY-MM-DD') === group.date)
            .map(r => r.value)
          
          if (pollutantValues.length > 0) {
            result[pollutant] = pollutantValues.reduce((sum, val) => sum + val, 0) / pollutantValues.length
          }
        })
      }

      return result
    })

    // Sort by date
    return processed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const calculateStatistics = (data: any[]) => {
    if (data.length === 0) return

    const values = data.map(d => d.value).filter(v => v != null)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    // Simple trend calculation (positive/negative)
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    const trend = ((secondAvg - firstAvg) / firstAvg) * 100

    setStatistics({ mean, max, min, trend })
  }

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data

    const now = dayjs()
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    }

    const days = ranges[timeRange as keyof typeof ranges]
    const cutoff = now.subtract(days, 'day')

    return data.filter(d => dayjs(d.date).isAfter(cutoff))
  }, [data, timeRange])

  const getPollutantColor = (pollutant: string) => {
    const p = POLLUTANTS.find(p => p.value === pollutant)
    return p?.color || '#666'
  }

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart
  const DataComponent = chartType === 'area' ? Area : Line

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Time Series Analysis</h2>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {(['7d', '30d', '90d', '1y', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === 'all' ? 'All' : range.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartType === 'line'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartType === 'area'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Area
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Mean Value</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {statistics.mean.toFixed(6)}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Minimum</span>
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-green-700">
              {statistics.min.toFixed(6)}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Maximum</span>
              <TrendingUp className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-lg font-semibold text-red-700">
              {statistics.max.toFixed(6)}
            </p>
          </div>
          
          <div className={`${statistics.trend > 0 ? 'bg-orange-50' : 'bg-blue-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Trend</span>
              {statistics.trend > 0 ? 
                <TrendingUp className="w-4 h-4 text-orange-600" /> :
                <TrendingDown className="w-4 h-4 text-blue-600" />
              }
            </div>
            <p className={`text-lg font-semibold ${statistics.trend > 0 ? 'text-orange-700' : 'text-blue-700'}`}>
              {statistics.trend > 0 ? '+' : ''}{statistics.trend.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Loading time series data...</p>
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => dayjs(date).format('MMM DD')}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                labelFormatter={(date) => dayjs(date).format('MMMM D, YYYY')}
                formatter={(value: any) => value?.toFixed(6)}
              />
              <Legend />
              
              {filters.pollutants && filters.pollutants.length > 1 ? (
                // Multiple pollutants
                filters.pollutants.map((pollutant: string) => (
                  <DataComponent
                    key={pollutant}
                    type="monotone"
                    dataKey={pollutant}
                    stroke={getPollutantColor(pollutant)}
                    fill={getPollutantColor(pollutant)}
                    fillOpacity={chartType === 'area' ? 0.3 : 0}
                    strokeWidth={2}
                    dot={false}
                    name={POLLUTANTS.find(p => p.value === pollutant)?.label || pollutant}
                  />
                ))
              ) : (
                // Single pollutant
                <DataComponent
                  type="monotone"
                  dataKey="value"
                  stroke={getPollutantColor(filters.pollutant || 'SO2')}
                  fill={getPollutantColor(filters.pollutant || 'SO2')}
                  fillOpacity={chartType === 'area' ? 0.3 : 0}
                  strokeWidth={2}
                  dot={false}
                  name={POLLUTANTS.find(p => p.value === (filters.pollutant || 'SO2'))?.label || 'Value'}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No time series data available</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
