'use client'

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
      <div className="flex gap-6 items-center">
        <span>
          <strong>TRON NOTES</strong>
        </span>
        <span className="text-tron-cyan/30">|</span>
        <span>Notes: {totalNotes}</span>
        <span className="text-tron-cyan/30">|</span>
        <span>Note: {currentNote}</span>
      </div>
      <div className="flex gap-6 items-center">
        <span className="flex items-center gap-1">
          <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            Ctrl
          </kbd>
          +
          <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            B
          </kbd>{' '}
          commands
        </span>
        <span className="text-tron-cyan/30">|</span>
        <span className="flex items-center gap-1">
          <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            J
          </kbd>
          <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            K
          </kbd>{' '}
          navigate
        </span>
        <span className="text-tron-cyan/30">|</span>
        <span className="flex items-center gap-1">
          <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            N
          </kbd>{' '}
          note
        </span>
        <span className="flex items-center gap-1">
          <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            E
          </kbd>{' '}
          edit
        </span>
        <span className="flex items-center gap-1">
          <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase shadow-[0_0_5px_rgba(0,234,255,0.3)]">
            D
          </kbd>{' '}
          delete
        </span>
      </div>
    </div>
  )
}
