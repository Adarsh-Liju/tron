'use client'

import { useState, useRef, useCallback } from 'react'
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
  onReorderNotes: (noteIds: string[]) => void
}

export function KeepGrid({
  notes,
  focusedNote,
  onNoteFocus,
  onEditNote,
  onDeleteNote,
  onResizeNote,
  onReorderNotes,
}: KeepGridProps) {
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  const handleDragStart = (noteId: string) => {
    setDraggedNoteId(noteId)
  }

  const handleDragEnd = () => {
    setDraggedNoteId(null)
    setDragOverIndex(null)
    // Reset all transforms
    if (gridRef.current) {
      Array.from(gridRef.current.children).forEach((el) => {
        (el as HTMLElement).style.transform = ''
      })
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedNoteId && draggedNoteId !== notes[index].id) {
      setDragOverIndex(index)
      
      // Visual reordering during drag
      const draggedIndex = notes.findIndex(n => n.id === draggedNoteId)
      if (draggedIndex !== -1 && draggedIndex !== index) {
        const noteElements = Array.from(gridRef.current!.children) as HTMLElement[]
        const draggedEl = noteElements[draggedIndex]
        const targetEl = noteElements[index]
        
        if (draggedEl && targetEl) {
          if (draggedIndex < index) {
            // Moving down
            targetEl.style.transform = 'translateY(-100%)'
          } else {
            // Moving up
            targetEl.style.transform = 'translateY(100%)'
          }
        }
      }
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Reset all transforms
    Array.from(gridRef.current!.children).forEach((el) => {
      (el as HTMLElement).style.transform = ''
    })
    
    if (!draggedNoteId) {
      setDragOverIndex(null)
      return
    }

    const draggedIndex = notes.findIndex(n => n.id === draggedNoteId)
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDragOverIndex(null)
      return
    }

    // Reorder notes
    const newOrder = [...notes]
    const [removed] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, removed)
    
    const noteIds = newOrder.map(n => n.id)
    onReorderNotes(noteIds)
    
    setDragOverIndex(null)
  }

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const currentTarget = e.currentTarget as HTMLElement
    const relatedTarget = e.relatedTarget as HTMLElement
    
    if (!currentTarget.contains(relatedTarget)) {
      if (dragOverIndex === index) {
        setDragOverIndex(null)
        currentTarget.style.transform = ''
      }
    }
  }


  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-6 auto-rows-min min-h-[calc(100vh-120px)]"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        e.preventDefault()
        // Reset transforms
        Array.from(gridRef.current!.children).forEach((el) => {
          (el as HTMLElement).style.transform = ''
        })
        setDragOverIndex(null)
      }}
    >
      {notes.map((note, index) => {
        const isDragOver = dragOverIndex === index
        const isDragging = draggedNoteId === note.id

        return (
          <div
            key={note.id}
            className={cn(
              'note-item transition-all duration-200',
              isDragOver && 'scale-105 z-10',
              isDragging && 'dragging'
            )}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragLeave={(e) => {
              e.preventDefault()
              const currentTarget = e.currentTarget as HTMLElement
              const relatedTarget = e.relatedTarget as HTMLElement
              
              if (!currentTarget.contains(relatedTarget) && dragOverIndex === index) {
                setDragOverIndex(null)
                currentTarget.style.transform = ''
              }
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
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </div>
        )
      })}
    </div>
  )
}
