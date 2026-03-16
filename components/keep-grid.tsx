'use client'

import { useState, useRef, useEffect } from 'react'
import { KeepNote } from './keep-note'
import { type Note } from '@/lib/notes-db'
import { cn } from '@/lib/utils'

interface KeepGridProps {
  notes: Note[]
  focusedNote: number
  onNoteFocus: (index: number) => void
  onEditNote: (noteIndex: number) => void
  onDeleteNote: (noteIndex: number) => void
  onResizeNote: (noteId: string, width: number, height: number) => void
  onUpdateNotePosition: (noteId: string, x: number, y: number) => void
}

export function KeepGrid({
  notes,
  focusedNote,
  onNoteFocus,
  onEditNote,
  onDeleteNote,
  onResizeNote,
  onUpdateNotePosition,
}: KeepGridProps) {
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  const handleDragStart = (noteId: string, e: React.DragEvent) => {
    setDraggedNoteId(noteId)
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
      <div
        className="relative"
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
