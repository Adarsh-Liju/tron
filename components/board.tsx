'use client'

import { useState } from 'react'
import { ResizableNote } from './resizable-note'
import { Button } from './ui/button'
import { type Board, type Note } from '@/lib/db'
import { cn } from '@/lib/utils'

interface BoardProps {
  board: Board
  boardIndex: number
  focusedBoard: number
  focusedNote: number
  onNoteFocus: (index: number) => void
  onEditNote: (noteIndex: number) => void
  onDeleteNote: (noteIndex: number) => void
  onEditBoard: () => void
  onDeleteBoard: () => void
  onMoveNote: (noteId: string, targetBoardId: string) => void
  onResizeNote: (noteId: string, width: number, height: number) => void
  onReorderNotes: (noteIds: string[]) => void
}

export function Board({
  board,
  boardIndex,
  focusedBoard,
  focusedNote,
  onNoteFocus,
  onEditNote,
  onDeleteNote,
  onEditBoard,
  onDeleteBoard,
  onMoveNote,
  onResizeNote,
  onReorderNotes,
}: BoardProps) {
  const [dragOver, setDragOver] = useState(false)
  const isFocused = boardIndex === focusedBoard

  return (
    <div
      className={cn(
        'min-w-[320px] max-w-[400px] w-full border-2 p-5 bg-[rgba(0,19,24,0.6)] backdrop-blur-sm transition-all flex flex-col shadow-[0_0_15px_rgba(0,234,255,0.2)] flex-shrink-0 relative group',
        isFocused
          ? 'border-tron-cyan shadow-[0_0_20px_#00eaff,0_0_40px_rgba(0,234,255,0.4)] scale-[1.02] bg-[rgba(0,19,24,0.8)] animate-pulse'
          : 'border-tron-cyan/30',
        dragOver && 'border-tron-cyan-light shadow-[0_0_30px_rgba(0,234,255,0.7)] scale-[1.01] bg-[rgba(0,19,24,0.95)]'
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <h2 className="border-b-2 border-tron-cyan/30 pb-3 mb-4 text-lg font-bold uppercase tracking-wider text-tron-cyan-light flex items-center justify-between [text-shadow:0_0_10px_#00eaff]">
        <span>{board.name}</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-xs border border-tron-cyan/30 hover:border-tron-cyan"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation()
              onEditBoard()
            }}
          >
            ✎
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-xs border border-tron-cyan/30 hover:border-tron-cyan"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteBoard()
            }}
          >
            ✕
          </Button>
        </div>
      </h2>
      <div 
        className="flex flex-col gap-3 mt-2 flex-1 overflow-y-auto overflow-x-hidden pr-1 min-h-0"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(e) => {
          e.preventDefault()
          try {
            const data = JSON.parse(e.dataTransfer.getData('text/html'))
            if (data.noteId && data.boardId !== board.id) {
              onMoveNote(data.noteId, board.id)
            }
          } catch (err) {
            // Ignore
          }
        }}
      >
        {board.notes.map((note, noteIndex) => (
          <ResizableNote
            key={note.id}
            note={note}
            noteIndex={noteIndex}
            boardId={board.id}
            boardIndex={boardIndex}
            focusedBoard={focusedBoard}
            focusedNote={focusedNote}
            onFocus={onNoteFocus}
            onEdit={onEditNote}
            onDelete={onDeleteNote}
            onMove={onMoveNote}
            onResize={onResizeNote}
            onReorder={(noteIds) => {
              // Get all note IDs in current order
              const allNoteIds = board.notes.map(n => n.id)
              const [draggedId, targetId] = noteIds
              const draggedIndex = allNoteIds.indexOf(draggedId)
              const targetIndex = allNoteIds.indexOf(targetId)
              
              if (draggedIndex !== -1 && targetIndex !== -1) {
                // Remove dragged item
                allNoteIds.splice(draggedIndex, 1)
                // Insert at target position
                const newTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex
                allNoteIds.splice(newTargetIndex, 0, draggedId)
                onReorderNotes(allNoteIds)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
