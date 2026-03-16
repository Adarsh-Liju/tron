'use client'

import { Separator } from './ui/separator'
import { Badge } from './ui/badge'

interface StatusBarProps {
  boards: any[]
  focusedBoard: number
  focusedNote: number
  noteCount?: number
}

export function StatusBar({ boards, focusedBoard, focusedNote, noteCount: totalNotes = 0 }: StatusBarProps) {
  const currentNote = focusedNote >= 0 ? `${focusedNote + 1}/${totalNotes}` : '-'

  return (
    <div className="fixed bottom-0 w-full bg-[rgba(0,19,24,0.95)] backdrop-blur-md border-t-2 border-tron-cyan/60 px-4 py-2 text-xs text-tron-cyan flex justify-between items-center z-[100] shadow-[0_-2px_20px_rgba(0,234,255,0.2)] font-mono">
      <div className="flex gap-4 items-center">
        <span>
          <strong>TRON NOTES</strong>
        </span>
        <Separator orientation="vertical" className="h-4 bg-tron-cyan/30" />
        <span>Notes: {totalNotes}</span>
        <Separator orientation="vertical" className="h-4 bg-tron-cyan/30" />
        <span>Note: {currentNote}</span>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-tron-cyan/20 border-tron-cyan text-tron-cyan font-mono text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            Ctrl
          </Badge>
          +
          <Badge variant="outline" className="bg-tron-cyan/20 border-tron-cyan text-tron-cyan font-mono text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            B
          </Badge>
          <span className="ml-1">commands</span>
        </div>
        <Separator orientation="vertical" className="h-4 bg-tron-cyan/30" />
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-tron-cyan/20 border-tron-cyan text-tron-cyan font-mono text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            J
          </Badge>
          <Badge variant="outline" className="bg-tron-cyan/20 border-tron-cyan text-tron-cyan font-mono text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            K
          </Badge>
          <span className="ml-1">navigate</span>
        </div>
        <Separator orientation="vertical" className="h-4 bg-tron-cyan/30" />
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-tron-cyan/20 border-tron-cyan text-tron-cyan font-mono text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            N
          </Badge>
          <span className="ml-1">note</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-tron-cyan/20 border-tron-cyan text-tron-cyan font-mono text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            E
          </Badge>
          <span className="ml-1">edit</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="bg-tron-cyan/20 border-tron-cyan text-tron-cyan font-mono text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            D
          </Badge>
          <span className="ml-1">delete</span>
        </div>
      </div>
    </div>
  )
}
