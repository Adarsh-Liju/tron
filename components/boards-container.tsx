'use client'

import { Board } from './board'
import { type Board as BoardType } from '@/lib/db'

interface BoardsContainerProps {
  boards: BoardType[]
  focusedBoard: number
  focusedNote: number
  onBoardFocus: (index: number) => void
  onNoteFocus: (index: number) => void
  onEditBoard: (index: number) => void
  onDeleteBoard: (index: number) => void
  onEditNote: (boardIndex: number, noteIndex: number) => void
  onDeleteNote: (boardIndex: number, noteIndex: number) => void
  onMoveNote: (noteId: string, targetBoardId: string) => void
  onReorderNotes: (boardId: string, noteIds: string[]) => void
  onResizeNote: (noteId: string, width: number, height: number) => void
  onReload: () => void
}

export function BoardsContainer({
  boards,
  focusedBoard,
  focusedNote,
  onBoardFocus,
  onNoteFocus,
  onEditBoard,
  onDeleteBoard,
  onEditNote,
  onDeleteNote,
  onMoveNote,
  onReorderNotes,
  onResizeNote,
  onReload,
}: BoardsContainerProps) {
  return (
    <div className="flex gap-6 p-6 overflow-x-auto overflow-y-hidden h-[calc(100vh-120px)] relative z-10 scroll-smooth">
      {boards.map((board, index) => (
        <Board
          key={board.id}
          board={board}
          boardIndex={index}
          focusedBoard={focusedBoard}
          focusedNote={focusedNote}
          onNoteFocus={onNoteFocus}
          onEditNote={(noteIndex) => onEditNote(index, noteIndex)}
          onDeleteNote={(noteIndex) => onDeleteNote(index, noteIndex)}
          onEditBoard={() => onEditBoard(index)}
          onDeleteBoard={() => onDeleteBoard(index)}
          onMoveNote={onMoveNote}
          onResizeNote={onResizeNote}
          onReorderNotes={(noteIds) => onReorderNotes(board.id, noteIds)}
        />
      ))}
    </div>
  )
}
