'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from './topbar'
import { BoardsContainer } from './boards-container'
import { StatusBar } from './status-bar'
import { CommandPalette } from './command-palette'
import { InputModal } from './input-modal'
import { ConfirmModal } from './confirm-modal'
import {
  getAllBoards,
  addBoard as dbAddBoard,
  updateBoard as dbUpdateBoard,
  deleteBoard as dbDeleteBoard,
  addNote as dbAddNote,
  updateNote as dbUpdateNote,
  deleteNote as dbDeleteNote,
  moveNoteToBoard as dbMoveNoteToBoard,
  reorderNotes as dbReorderNotes,
  type Board,
  type Note,
} from '@/lib/db'
import { useKeybindings } from '@/hooks/use-keybindings'

export function TronApp() {
  const [boards, setBoards] = useState<Board[]>([])
  const [focusedBoard, setFocusedBoard] = useState(0)
  const [focusedNote, setFocusedNote] = useState(-1)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [inputModal, setInputModal] = useState<{ open: boolean; title: string; defaultValue: string; markdown?: boolean; onConfirm: (value: string) => void } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string; title: string; onConfirm: () => void } | null>(null)

  const loadBoards = useCallback(() => {
    const loadedBoards = getAllBoards()
    setBoards(loadedBoards)
    if (loadedBoards.length > 0 && focusedBoard >= loadedBoards.length) {
      setFocusedBoard(Math.max(0, loadedBoards.length - 1))
    }
  }, [focusedBoard])

  useEffect(() => {
    loadBoards()
  }, [loadBoards])

  const showInputModal = (title: string, defaultValue: string = '', markdown: boolean = false): Promise<string | null> => {
    return new Promise((resolve) => {
      setInputModal({
        open: true,
        title,
        defaultValue,
        markdown,
        onConfirm: (value: string) => {
          setInputModal(null)
          resolve(value.trim() || null)
        },
      })
    })
  }

  const showConfirmModal = (message: string, title: string = 'Confirm'): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        open: true,
        message,
        title,
        onConfirm: () => {
          setConfirmModal(null)
          resolve(true)
        },
      })
    })
  }

  const handleAddBoard = async () => {
    const name = await showInputModal('Board name:', '')
    if (!name) return
    dbAddBoard(name)
    loadBoards()
    const newBoards = getAllBoards()
    const index = newBoards.findIndex(b => b.name === name)
    if (index >= 0) setFocusedBoard(index)
  }

  const handleAddNote = async () => {
    if (boards.length === 0) {
      await showConfirmModal('Create a board first!', 'No Boards')
      return
    }
    const text = await showInputModal('New note:', '')
    if (!text) return
    dbAddNote(boards[0].id, text)
    loadBoards()
    setFocusedBoard(0)
    const updatedBoards = getAllBoards()
    if (updatedBoards[0]?.notes.length) {
      setFocusedNote(updatedBoards[0].notes.length - 1)
    }
  }

  const handleAddNoteToFocusedBoard = async () => {
    if (boards.length === 0) {
      await showConfirmModal('Create a board first!', 'No Boards')
      return
    }
    const text = await showInputModal('New note:', '')
    if (!text) return
    dbAddNote(boards[focusedBoard].id, text)
    loadBoards()
    const updatedBoards = getAllBoards()
    if (updatedBoards[focusedBoard]?.notes.length) {
      setFocusedNote(updatedBoards[focusedBoard].notes.length - 1)
    }
  }

  const handleEditFocused = async () => {
    if (focusedNote >= 0 && boards[focusedBoard]?.notes[focusedNote]) {
      const note = boards[focusedBoard].notes[focusedNote]
      const updated = await showInputModal('Edit note:', note.text, true)
      if (updated !== null && updated !== '') {
        dbUpdateNote(note.id, updated)
        loadBoards()
      }
    } else if (boards[focusedBoard]) {
      const board = boards[focusedBoard]
      const updated = await showInputModal('Edit board name:', board.name)
      if (updated !== null && updated.trim()) {
        dbUpdateBoard(board.id, updated.trim())
        loadBoards()
      }
    }
  }

  const handleResizeNote = (noteId: string, width: number, height: number) => {
    // Dimensions are saved in localStorage by the ResizableNote component
    // This handler can be used for future database storage if needed
    console.log(`Note ${noteId} resized to ${width}x${height}`)
  }

  const handleDeleteFocused = async () => {
    if (focusedNote >= 0 && boards[focusedBoard]?.notes[focusedNote]) {
      const confirmed = await showConfirmModal('Delete this note?', 'Delete Note')
      if (confirmed) {
        const note = boards[focusedBoard].notes[focusedNote]
        dbDeleteNote(note.id)
        loadBoards()
        setFocusedNote(Math.max(-1, focusedNote - 1))
      }
    } else if (boards[focusedBoard] && boards.length > 1) {
      const confirmed = await showConfirmModal('Delete this board? All notes will be lost.', 'Delete Board')
      if (confirmed) {
        const board = boards[focusedBoard]
        dbDeleteBoard(board.id)
        loadBoards()
        setFocusedBoard(Math.max(0, Math.min(focusedBoard, boards.length - 2)))
        setFocusedNote(-1)
      }
    }
  }

  const moveBoard = (direction: number) => {
    const newIndex = focusedBoard + direction
    if (newIndex >= 0 && newIndex < boards.length) {
      setFocusedBoard(newIndex)
      setFocusedNote(-1)
    }
  }

  const moveNote = (direction: number) => {
    if (boards.length === 0) return
    const board = boards[focusedBoard]
    if (!board) return

    if (focusedNote === -1 && direction > 0) {
      setFocusedNote(0)
    } else if (focusedNote === -1 && direction < 0) {
      setFocusedNote(board.notes.length - 1)
    } else {
      const newIndex = focusedNote + direction
      if (newIndex >= 0 && newIndex < board.notes.length) {
        setFocusedNote(newIndex)
      }
    }
  }

  useKeybindings({
    'h': () => moveBoard(-1),
    'j': () => moveNote(1),
    'k': () => moveNote(-1),
    'l': () => moveBoard(1),
    'ArrowLeft': () => moveBoard(-1),
    'ArrowDown': () => moveNote(1),
    'ArrowUp': () => moveNote(-1),
    'ArrowRight': () => moveBoard(1),
    'n': handleAddNote,
    'N': handleAddNoteToFocusedBoard,
    'b': handleAddBoard,
    'e': handleEditFocused,
    'Enter': handleEditFocused,
    'd': handleDeleteFocused,
    'x': handleDeleteFocused,
    'g': () => boards.length > 0 && setFocusedBoard(0),
    'G': () => boards.length > 0 && setFocusedBoard(boards.length - 1),
    'Escape': () => {
      if (commandPaletteOpen) setCommandPaletteOpen(false)
      if (inputModal) setInputModal(null)
      if (confirmModal) setConfirmModal(null)
    },
    'Ctrl+b': (e) => {
      e.preventDefault()
      setCommandPaletteOpen(true)
    },
    'Ctrl+p': (e) => {
      e.preventDefault()
      setCommandPaletteOpen(true)
    },
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar onAddBoard={handleAddBoard} onAddNote={handleAddNote} />
      <BoardsContainer
        boards={boards}
        focusedBoard={focusedBoard}
        focusedNote={focusedNote}
        onBoardFocus={setFocusedBoard}
        onNoteFocus={setFocusedNote}
        onEditBoard={(index) => {
          setFocusedBoard(index)
          setFocusedNote(-1)
          handleEditFocused()
        }}
        onDeleteBoard={async (index) => {
          if (boards.length <= 1) {
            await showConfirmModal('Cannot delete the last board!', 'Error')
            return
          }
          const confirmed = await showConfirmModal('Delete this board? All notes will be lost.', 'Delete Board')
          if (confirmed) {
            dbDeleteBoard(boards[index].id)
            loadBoards()
            setFocusedBoard(Math.max(0, Math.min(focusedBoard, boards.length - 2)))
            setFocusedNote(-1)
          }
        }}
        onEditNote={async (boardIndex, noteIndex) => {
          setFocusedBoard(boardIndex)
          setFocusedNote(noteIndex)
          const note = boards[boardIndex].notes[noteIndex]
          const updated = await showInputModal('Edit note', note.text, true)
          if (updated !== null && updated !== '') {
            dbUpdateNote(note.id, updated)
            loadBoards()
          }
        }}
        onDeleteNote={async (boardIndex, noteIndex) => {
          const confirmed = await showConfirmModal('Delete this note?', 'Delete Note')
          if (confirmed) {
            const note = boards[boardIndex].notes[noteIndex]
            dbDeleteNote(note.id)
            loadBoards()
            setFocusedNote(Math.max(-1, focusedNote - 1))
          }
        }}
        onMoveNote={dbMoveNoteToBoard}
        onResizeNote={handleResizeNote}
        onReorderNotes={dbReorderNotes}
        onReload={loadBoards}
      />
      <StatusBar
        boards={boards}
        focusedBoard={focusedBoard}
        focusedNote={focusedNote}
      />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={[
          { name: 'Add Board', key: 'b', action: handleAddBoard },
          { name: 'Add Note', key: 'n', action: handleAddNote },
          { name: 'Edit Focused', key: 'e', action: handleEditFocused },
          { name: 'Delete Focused', key: 'd', action: handleDeleteFocused },
        ]}
      />
      {inputModal && (
        <InputModal
          open={inputModal.open}
          title={inputModal.title}
          defaultValue={inputModal.defaultValue}
          markdown={inputModal.markdown}
          onConfirm={inputModal.onConfirm}
          onCancel={() => setInputModal(null)}
        />
      )}
      {confirmModal && (
        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}
