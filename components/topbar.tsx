'use client'

import { Button } from './ui/button'

interface TopBarProps {
  onAddBoard?: () => void
  onAddNote: () => void
}

export function TopBar({ onAddBoard, onAddNote }: TopBarProps) {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b-2 border-tron-cyan/60 bg-[rgba(0,19,24,0.8)] backdrop-blur-sm relative z-[100] shadow-[0_2px_20px_rgba(0,234,255,0.2)]">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold font-orbitron text-tron-cyan tracking-wider animate-[logoGlow_2s_ease-in-out_infinite_alternate] [text-shadow:0_0_10px_#00eaff,0_0_20px_#00eaff]">
          ⚡ TRON NOTES
        </span>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onAddNote}
          className="border-2 border-tron-cyan text-tron-cyan uppercase tracking-wider text-xs px-4 py-2 hover:bg-tron-cyan/10 hover:shadow-[0_0_15px_rgba(0,234,255,0.4)] transition-all"
        >
          + NOTE
        </Button>
      </div>
    </header>
  )
}
