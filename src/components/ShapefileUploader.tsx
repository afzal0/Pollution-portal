"use client"

import { useState, useRef } from 'react'
import { Upload, File, X, MapPin } from 'lucide-react'

interface ShapefileUploaderProps {
  onShapefileUpload: (geojson: any) => void
  onCancel: () => void
  isActive: boolean
}

export default function ShapefileUploader({ onShapefileUpload, onCancel, isActive }: ShapefileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const shapefile = files.find(file => 
      file.name.toLowerCase().endsWith('.shp') || 
      file.name.toLowerCase().endsWith('.zip')
    )
    
    if (shapefile) {
      setUploadedFile(shapefile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const processShapefile = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    try {
      // For now, we'll show a message that shapefile processing needs to be implemented
      // In a real implementation, you'd use a library like shpjs or send to a backend service
      alert('Shapefile processing will be implemented. For now, please use the polygon drawing tool.')
      onCancel()
    } catch (error) {
      console.error('Error processing shapefile:', error)
      alert('Error processing shapefile. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isActive) return null

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 w-80">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">Upload Shapefile</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop a shapefile (.shp or .zip) here
          </p>
          <p className="text-xs text-gray-500 mb-4">
            or click to browse files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".shp,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
            <File className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 flex-1">
              {uploadedFile.name}
            </span>
            <button
              onClick={resetUpload}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>• Supported formats: .shp, .zip</p>
            <p>• File size limit: 10MB</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={processShapefile}
              disabled={isProcessing}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Process'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
