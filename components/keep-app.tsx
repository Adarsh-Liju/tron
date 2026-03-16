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
  updateNoteSize as dbUpdateNoteSize,
  updateNotePosition as dbUpdateNotePosition,
  autoArrangeNotes as dbAutoArrangeNotes,
  type Note,
} from '@/lib/notes-db'
import { useKeybindings } from '@/hooks/use-keybindings'
import { useToast } from '@/hooks/use-toast'
import { playTronBeep, playClick, playLaserZap, playError } from '@/lib/sounds'

export function KeepApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [focusedNote, setFocusedNote] = useState(-1)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [inputModal, setInputModal] = useState<{ open: boolean; title: string; defaultValue: string; markdown?: boolean; onConfirm: (value: string) => void } | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; message: string; title: string; onConfirm: () => void } | null>(null)
  const { toast } = useToast()

  const loadNotes = useCallback(async () => {
    try {
      const loadedNotes = await getAllNotes()
      setNotes(loadedNotes)
      if (loadedNotes.length > 0 && focusedNote >= loadedNotes.length) {
        setFocusedNote(Math.max(0, loadedNotes.length - 1))
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }, [focusedNote])

  useEffect(() => {
    initDatabase().then(async () => {
      const loadedNotes = await getAllNotes()
      // Auto-arrange notes that don't have positions
      const needsArrangement = loadedNotes.some(note => note.x === null || note.y === null)
      if (needsArrangement && loadedNotes.length > 0) {
        await dbAutoArrangeNotes()
      }
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
    playClick()
    const text = await showInputModal('New note:', '', true)
    if (!text) {
      playError()
      return
    }
    playLaserZap()
    const newNote = await dbAddNote(text)
    if (newNote) {
      // Auto-arrange all notes including the new one
      await dbAutoArrangeNotes()
    }
    await loadNotes()
    const updatedNotes = await getAllNotes()
    if (updatedNotes.length) {
      setFocusedNote(updatedNotes.length - 1)
    }
    toast({
      title: "Note Created",
      description: "Your note has been added successfully.",
      className: "bg-tron-cyan/10 border-tron-cyan text-tron-cyan",
    })
  }

  const handleEditFocused = async () => {
    if (focusedNote >= 0 && notes[focusedNote]) {
      playClick()
      const note = notes[focusedNote]
      const updated = await showInputModal('Edit note:', note.text, true)
      if (updated !== null && updated !== '') {
        playTronBeep()
        await dbUpdateNote(note.id, updated)
        await loadNotes()
        toast({
          title: "Note Updated",
          description: "Your note has been saved.",
          className: "bg-tron-cyan/10 border-tron-cyan text-tron-cyan",
        })
      }
    }
  }

  const handleDeleteFocused = async () => {
    if (focusedNote >= 0 && notes[focusedNote]) {
      playClick()
      const confirmed = await showConfirmModal('Delete this note?', 'Delete Note')
      if (confirmed) {
        playError()
        const note = notes[focusedNote]
        await dbDeleteNote(note.id)
        await loadNotes()
        setFocusedNote(Math.max(-1, focusedNote - 1))
        toast({
          title: "Note Deleted",
          description: "The note has been removed.",
          className: "bg-[#ff0066]/10 border-[#ff0066] text-[#ff0066]",
        })
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

  const handleAutoArrange = async () => {
    await dbAutoArrangeNotes()
    await loadNotes()
    toast({
      title: "Notes Auto-Arranged",
      description: "All notes have been automatically arranged.",
      className: "bg-tron-cyan/10 border-tron-cyan text-tron-cyan",
    })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar onAddNote={handleAddNote} onAutoArrange={handleAutoArrange} />
      <div className="flex-1 overflow-hidden">
        <KeepGrid
        notes={notes}
        focusedNote={focusedNote}
        onNoteFocus={setFocusedNote}
        onAddNote={handleAddNote}
        onEditNote={async (noteIndex) => {
          setFocusedNote(noteIndex)
          const note = notes[noteIndex]
          const updated = await showInputModal('Edit note', note.text, true)
          if (updated !== null && updated !== '') {
            await dbUpdateNote(note.id, updated)
            await loadNotes()
            toast({
              title: "Note Updated",
              description: "Your note has been saved.",
              className: "bg-tron-cyan/10 border-tron-cyan text-tron-cyan",
            })
          }
        }}
        onDeleteNote={async (noteIndex) => {
          const confirmed = await showConfirmModal('Delete this note?', 'Delete Note')
          if (confirmed) {
            const note = notes[noteIndex]
            await dbDeleteNote(note.id)
            await loadNotes()
            setFocusedNote(Math.max(-1, focusedNote - 1))
            toast({
              title: "Note Deleted",
              description: "The note has been removed.",
              className: "bg-[#ff0066]/10 border-[#ff0066] text-[#ff0066]",
            })
          }
        }}
        onResizeNote={async (noteId, width, height) => {
          await dbUpdateNoteSize(noteId, width, height)
          await loadNotes()
        }}
        onUpdateNotePosition={async (noteId, x, y) => {
          await dbUpdateNotePosition(noteId, x, y)
          await loadNotes()
        }}
      />
      </div>
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
      <footer className="text-xs text-tron-cyan/30 text-center py-2 bg-[rgba(0,19,24,0.8)] border-t-2 border-tron-cyan/30">
        Made with ❤️ by Adarsh Liju Abraham
      </footer>
    </div>
  )
}
