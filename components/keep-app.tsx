'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from './topbar'
import { KeepGrid } from './keep-grid'
import { StatusBar } from './status-bar'
import { CommandPalette } from './command-palette'
import { InputModal } from './input-modal'
import { ConfirmModal } from './confirm-modal'
import {
  initDatabase,
  getAllNotes,
  addNote as dbAddNote,
  updateNote as dbUpdateNote,
  deleteNote as dbDeleteNote,
  reorderNotes as dbReorderNotes,
  updateNoteSize as dbUpdateNoteSize,
  type Note,
} from '@/lib/notes-db'
import { useKeybindings } from '@/hooks/use-keybindings'

export function KeepApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [focusedNote, setFocusedNote] = useState(-1)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [inputModal, setInputModal] = useState<{ open: boolean; title: string; defaultValue: string; markdown?: boolean; onConfirm: (value: string) => void } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string; title: string; onConfirm: () => void } | null>(null)

  const loadNotes = useCallback(() => {
    const loadedNotes = getAllNotes()
    setNotes(loadedNotes)
    if (loadedNotes.length > 0 && focusedNote >= loadedNotes.length) {
      setFocusedNote(Math.max(0, loadedNotes.length - 1))
    }
  }, [focusedNote])

  useEffect(() => {
    initDatabase().then(() => {
      loadNotes()
    }).catch((error) => {
      console.error('Failed to initialize database:', error)
    })
  }, [loadNotes])

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

  const handleAddNote = async () => {
    const text = await showInputModal('New note:', '', true)
    if (!text) return
    dbAddNote(text)
    loadNotes()
    const updatedNotes = getAllNotes()
    if (updatedNotes.length) {
      setFocusedNote(updatedNotes.length - 1)
    }
  }

  const handleEditFocused = async () => {
    if (focusedNote >= 0 && notes[focusedNote]) {
      const note = notes[focusedNote]
      const updated = await showInputModal('Edit note:', note.text, true)
      if (updated !== null && updated !== '') {
        dbUpdateNote(note.id, updated)
        loadNotes()
      }
    }
  }

  const handleDeleteFocused = async () => {
    if (focusedNote >= 0 && notes[focusedNote]) {
      const confirmed = await showConfirmModal('Delete this note?', 'Delete Note')
      if (confirmed) {
        const note = notes[focusedNote]
        dbDeleteNote(note.id)
        loadNotes()
        setFocusedNote(Math.max(-1, focusedNote - 1))
      }
    }
  }

  const moveNote = (direction: number) => {
    if (notes.length === 0) return

    if (focusedNote === -1 && direction > 0) {
      setFocusedNote(0)
    } else if (focusedNote === -1 && direction < 0) {
      setFocusedNote(notes.length - 1)
    } else {
      const newIndex = focusedNote + direction
      if (newIndex >= 0 && newIndex < notes.length) {
        setFocusedNote(newIndex)
      }
    }
  }

  useKeybindings({
    'j': () => moveNote(1),
    'k': () => moveNote(-1),
    'ArrowDown': () => moveNote(1),
    'ArrowUp': () => moveNote(-1),
    'n': handleAddNote,
    'e': handleEditFocused,
    'Enter': handleEditFocused,
    'd': handleDeleteFocused,
    'x': handleDeleteFocused,
    'g': () => notes.length > 0 && setFocusedNote(0),
    'G': () => notes.length > 0 && setFocusedNote(notes.length - 1),
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
      <TopBar onAddNote={handleAddNote} />
      <KeepGrid
        notes={notes}
        focusedNote={focusedNote}
        onNoteFocus={setFocusedNote}
        onEditNote={async (noteIndex) => {
          setFocusedNote(noteIndex)
          const note = notes[noteIndex]
          const updated = await showInputModal('Edit note', note.text, true)
          if (updated !== null && updated !== '') {
            dbUpdateNote(note.id, updated)
            loadNotes()
          }
        }}
        onDeleteNote={async (noteIndex) => {
          const confirmed = await showConfirmModal('Delete this note?', 'Delete Note')
          if (confirmed) {
            const note = notes[noteIndex]
            dbDeleteNote(note.id)
            loadNotes()
            setFocusedNote(Math.max(-1, focusedNote - 1))
          }
        }}
        onResizeNote={(noteId, width, height) => {
          dbUpdateNoteSize(noteId, width, height)
          loadNotes()
        }}
        onReorderNotes={(noteIds) => {
          dbReorderNotes(noteIds)
          loadNotes()
        }}
      />
      <StatusBar
        boards={[]}
        focusedBoard={0}
        focusedNote={focusedNote}
        noteCount={notes.length}
      />
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={[
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
