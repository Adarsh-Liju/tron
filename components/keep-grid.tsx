'use client'

import { useState, useRef, useEffect } from 'react'
import { KeepNote } from './keep-note'
import { type Note } from '@/lib/notes-db'
import { cn } from '@/lib/utils'
import { playGridPulse, playWhoosh } from '@/lib/sounds'

interface KeepGridProps {
  notes: Note[]
  focusedNote: number
  onNoteFocus: (index: number) => void
  onEditNote: (noteIndex: number) => void
  onDeleteNote: (noteIndex: number) => void
  onResizeNote: (noteId: string, width: number, height: number) => void
  onUpdateNotePosition: (noteId: string, x: number, y: number) => void
  onAddNote?: () => void
}

export function KeepGrid({
  notes,
  focusedNote,
  onNoteFocus,
  onEditNote,
  onDeleteNote,
  onResizeNote,
  onUpdateNotePosition,
  onAddNote,
}: KeepGridProps) {
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [pulseActive, setPulseActive] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const handleDragStart = (noteId: string, e: React.DragEvent) => {
    setDraggedNoteId(noteId)
    playWhoosh()
    const note = notes.find(n => n.id === noteId)
    if (note && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const noteX = note.x ?? 0
      const noteY = note.y ?? 0
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      setDragOffset({
        x: mouseX - noteX,
        y: mouseY - noteY,
      })
    }
  }

  const handleDragEnd = () => {
    // Trigger pulse when drag ends (even if drop didn't fire)
    if (draggedNoteId) {
      setPulseActive(true)
      playGridPulse()
      setTimeout(() => {
        setPulseActive(false)
      }, 600)
    }
    setDraggedNoteId(null)
    setDragOffset(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedNoteId && dragOffset && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x
      const y = e.clientY - rect.top - dragOffset.y
      
      // Update position immediately for visual feedback
      const note = notes.find(n => n.id === draggedNoteId)
      if (note) {
        onUpdateNotePosition(draggedNoteId, Math.max(0, x), Math.max(0, y))
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedNoteId && dragOffset && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x
      const y = e.clientY - rect.top - dragOffset.y
      
      // Save final position
      onUpdateNotePosition(draggedNoteId, Math.max(0, x), Math.max(0, y))
      
      // Trigger pulse animation and sound
      setPulseActive(true)
      playGridPulse()
      setTimeout(() => {
        setPulseActive(false)
      }, 600)
    }
    
    handleDragEnd()
  }
  

  // Calculate canvas bounds based on note positions
  const canvasBounds = notes.reduce(
    (bounds, note) => {
      const noteX = (note.x ?? 0) + (note.width ?? 300)
      const noteY = (note.y ?? 0) + (note.height ?? 150)
      return {
        width: Math.max(bounds.width, noteX + 100),
        height: Math.max(bounds.height, noteY + 100),
      }
    },
    { width: 2000, height: 2000 }
  )

  // Empty state when no notes
  if (notes.length === 0) {
    return (
      <div
        ref={canvasRef}
        className="relative overflow-auto flex-1 flex items-center justify-center"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <div
          onClick={onAddNote}
          className={cn(
            'cursor-pointer group relative',
            'bg-[rgba(0,20,26,0.5)] border-2 border-dashed border-tron-cyan/30 rounded-lg',
            'p-12 max-w-md text-center transition-all duration-300',
            'hover:border-tron-cyan hover:bg-[rgba(0,20,26,0.8)] hover:shadow-[0_0_30px_rgba(0,234,255,0.4)]',
            'hover:scale-105'
          )}
        >
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <h3 className="text-xl font-orbitron text-tron-cyan-light mb-2 uppercase tracking-wider [text-shadow:0_0_10px_#00eaff]">
            No Notes Yet
          </h3>
          <p className="text-tron-cyan/70 font-mono text-sm mb-4">
            Click here to create your first note
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tron-cyan/10 border border-tron-cyan/30 rounded text-tron-cyan text-xs font-mono uppercase tracking-wider group-hover:bg-tron-cyan/20 group-hover:border-tron-cyan transition-all">
            <span>+</span>
            <span>Add Note</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={canvasRef}
      className="relative overflow-auto flex-1"
      style={{
        width: '100%',
        height: '100%',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Pulse overlay */}
      {pulseActive && (
        <div
          className="fixed inset-0 pointer-events-none z-40 animate-grid-pulse"
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 234, 255, 0.15) 0%, rgba(0, 234, 255, 0.05) 50%, transparent 100%)',
          }}
        />
      )}
      <div
        className={cn(
          "relative transition-all duration-300",
          pulseActive && 'animate-grid-pulse'
        )}
        style={{
          width: `${canvasBounds.width}px`,
          height: `${canvasBounds.height}px`,
          minWidth: '100%',
          minHeight: '100%',
        }}
      >
        {notes.map((note, index) => {
          const isDragging = draggedNoteId === note.id
          const x = note.x ?? null
          const y = note.y ?? null

          return (
            <div
              key={note.id}
              className={cn(
                'absolute transition-all',
                isDragging && 'z-50',
                !isDragging && 'z-10'
              )}
              style={{
                left: x !== null ? `${x}px` : 'auto',
                top: y !== null ? `${y}px` : 'auto',
                transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                opacity: isDragging ? 0.8 : 1,
              }}
            >
              <KeepNote
                note={note}
                noteIndex={index}
                focusedNote={focusedNote}
                onFocus={onNoteFocus}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
                onResize={onResizeNote}
                onDragStart={(noteId, e) => handleDragStart(noteId, e)}
                onDragEnd={handleDragEnd}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
