'use client'

import { useRef } from 'react'
import { Button } from './ui/button'
import { playClick } from '@/lib/sounds'

interface TopBarProps {
  onAddBoard?: () => void
  onAddNote: () => void
  onAutoArrange?: () => void
  onExport?: () => void
  onImport?: (file: File) => void
}

export function TopBar({ onAddBoard, onAddNote, onAutoArrange, onExport, onImport }: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b-2 border-tron-cyan/60 bg-[rgba(0,19,24,0.8)] backdrop-blur-sm relative z-[100] shadow-[0_2px_20px_rgba(0,234,255,0.2)]">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold font-orbitron text-tron-cyan tracking-wider animate-[logoGlow_2s_ease-in-out_infinite_alternate] [text-shadow:0_0_10px_#00eaff,0_0_20px_#00eaff]">
          ⚡ TRON NOTES
        </span>
      </div>
      <div className="flex gap-3">
        {onExport && (
          <Button
            variant="outline"
            onClick={() => {
              playClick()
              onExport()
            }}
            className="border-2 border-tron-cyan/50 text-tron-cyan/70 uppercase tracking-wider text-xs px-4 py-2 hover:bg-tron-cyan/10 hover:shadow-[0_0_15px_rgba(0,234,255,0.4)] transition-all"
          >
            EXPORT
          </Button>
        )}
        {onImport && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onImport(file)
                  e.target.value = ''
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                playClick()
                fileInputRef.current?.click()
              }}
              className="border-2 border-tron-cyan/50 text-tron-cyan/70 uppercase tracking-wider text-xs px-4 py-2 hover:bg-tron-cyan/10 hover:shadow-[0_0_15px_rgba(0,234,255,0.4)] transition-all"
            >
              IMPORT
            </Button>
          </>
        )}
        {onAutoArrange && (
          <Button
            variant="outline"
            onClick={() => {
              playClick()
              onAutoArrange()
            }}
            className="border-2 border-tron-cyan/50 text-tron-cyan/70 uppercase tracking-wider text-xs px-4 py-2 hover:bg-tron-cyan/10 hover:shadow-[0_0_15px_rgba(0,234,255,0.4)] transition-all"
          >
            AUTO ARRANGE
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            playClick()
            onAddNote()
          }}
          className="border-2 border-tron-cyan text-tron-cyan uppercase tracking-wider text-xs px-4 py-2 hover:bg-tron-cyan/10 hover:shadow-[0_0_15px_rgba(0,234,255,0.4)] transition-all"
        >
          + NOTE
        </Button>
      </div>
    </header>
  )
}
