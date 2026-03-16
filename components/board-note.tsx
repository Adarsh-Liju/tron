'use client'

import { useState, useRef } from 'react'
import { type Note } from '@/lib/db'
import { cn } from '@/lib/utils'

interface BoardNoteProps {
  note: Note
  noteIndex: number
  boardId: string
  boardIndex: number
  focusedBoard: number
  focusedNote: number
  onFocus: (index: number) => void
  onEdit: (noteIndex: number) => void
  onDelete: (noteIndex: number) => void
  onMove: (noteId: string, targetBoardId: string) => void
  onReorder: (noteIds: string[]) => void
}

export function BoardNote({
  note,
  noteIndex,
  boardId,
  boardIndex,
  focusedBoard,
  focusedNote,
  onFocus,
  onEdit,
  onDelete,
  onReorder,
}: BoardNoteProps) {
  const [dragging, setDragging] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const isFocused = boardIndex === focusedBoard && noteIndex === focusedNote
  const noteRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    setDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', note.id)
  }

  const handleDragEnd = () => {
    setDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const draggedNoteId = e.dataTransfer.getData('text/html')
    if (draggedNoteId && draggedNoteId !== note.id) {
      // Handle reordering logic here
    }
  }

  return (
    <div
      ref={noteRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        onFocus(noteIndex)
        onEdit(noteIndex)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onFocus(noteIndex)
        onDelete(noteIndex)
      }}
      className={cn(
        'bg-[rgba(0,20,26,0.8)] border border-tron-cyan/30 p-4 cursor-grab active:cursor-grabbing transition-all relative animate-fadein break-words leading-relaxed font-mono text-sm select-none',
        'hover:shadow-[0_0_15px_rgba(0,234,255,0.4)] hover:translate-x-1 hover:border-tron-cyan/60 hover:bg-[rgba(0,20,26,0.95)]',
        isFocused &&
          'border-tron-cyan border-l-tron-cyan shadow-[0_0_20px_rgba(0,234,255,0.6)] translate-x-[6px] bg-[rgba(0,20,26,1)] animate-pulse',
        dragging && 'opacity-40 rotate-[2deg] scale-95 cursor-grabbing z-[1000]',
        dragOver && 'border-t-2 border-t-dashed border-t-tron-cyan mt-2 pt-6'
      )}
      style={{
        borderLeft: isFocused ? '3px solid #00eaff' : '3px solid transparent',
      }}
    >
      {note.text}
    </div>
  )
}
