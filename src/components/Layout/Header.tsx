"use client"

import { Activity, Info, Menu } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {

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
                <h1 className="text-2xl font-bold tracking-tight">AUS-HEALTHSCAPE</h1>
                <p className="text-sm text-blue-100">Environmental & Social Determinants Repository (2018–2024)</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
            >
              <Info className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

    </header>
  )
}
