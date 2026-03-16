'use client'

import { nanoid } from 'nanoid'

const DB_NAME = 'tronNotesDb'
const DB_VERSION = 1
const STORE_NAME = 'notes'

let db: IDBDatabase | null = null

export interface Note {
  id: string
  text: string
  position: number
  x?: number | null
  y?: number | null
  width?: number
  height?: number
  created_at?: string
  updated_at?: string
}

// Initialize IndexedDB
export async function initDatabase(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create object store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        objectStore.createIndex('position', 'position', { unique: false })
        objectStore.createIndex('created_at', 'created_at', { unique: false })
      }
    }
  })
}

// Migrate from old localStorage SQLite data if exists
async function migrateFromOldDb() {
  if (typeof window === 'undefined') return

  const oldDb = localStorage.getItem('tronNotesDb')
  if (!oldDb) return

  try {
    // Try to parse old SQLite data (it was stored as JSON array)
    const uint8Array = JSON.parse(oldDb)
    // If it's SQLite data, we'll skip migration and let user start fresh
    // Or we could try to read it, but it's complex
    console.log('Old SQLite data found, starting fresh with IndexedDB')
  } catch (error) {
    console.warn('Migration error:', error)
  }
}

export async function getAllNotes(): Promise<Note[]> {
  if (!db) {
    await initDatabase()
  }

  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.getAll()

    request.onsuccess = () => {
      const notes = request.result as Note[]
      // Sort by position, then by created_at
      notes.sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position
        }
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
        return aDate - bDate
      })
      resolve(notes)
    }

    request.onerror = () => {
      reject(new Error('Failed to get notes'))
    }
  })
}

export async function addNote(text: string): Promise<Note | null> {
  if (!db) {
    await initDatabase()
  }

  return new Promise(async (resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    // Get max position
    const allNotes = await getAllNotes()
    const maxPosition = allNotes.length > 0 
      ? Math.max(...allNotes.map(n => n.position)) + 1 
      : 0

    const id = nanoid()
    const now = new Date().toISOString()
    const note: Note = {
      id,
      text,
      position: maxPosition,
      x: null,
      y: null,
      width: 300,
      height: 150,
      created_at: now,
      updated_at: now,
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.add(note)

    request.onsuccess = () => {
      resolve(note)
    }

    request.onerror = () => {
      reject(new Error('Failed to add note'))
    }
  })
}

export async function updateNote(id: string, text: string): Promise<boolean> {
  if (!db) {
    await initDatabase()
  }

  return new Promise(async (resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const getRequest = objectStore.get(id)

    getRequest.onsuccess = () => {
      const note = getRequest.result
      if (!note) {
        reject(new Error('Note not found'))
        return
      }

      note.text = text
      note.updated_at = new Date().toISOString()

      const putRequest = objectStore.put(note)
      putRequest.onsuccess = () => resolve(true)
      putRequest.onerror = () => reject(new Error('Failed to update note'))
    }

    getRequest.onerror = () => {
      reject(new Error('Failed to get note'))
    }
  })
}

export async function deleteNote(id: string): Promise<boolean> {
  if (!db) {
    await initDatabase()
  }

  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.delete(id)

    request.onsuccess = () => {
      resolve(true)
    }

    request.onerror = () => {
      reject(new Error('Failed to delete note'))
    }
  })
}

export async function updateNoteSize(noteId: string, width: number, height: number): Promise<boolean> {
  if (!db) {
    await initDatabase()
  }

  return new Promise(async (resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const getRequest = objectStore.get(noteId)

    getRequest.onsuccess = () => {
      const note = getRequest.result
      if (!note) {
        reject(new Error('Note not found'))
        return
      }

      note.width = width
      note.height = height
      note.updated_at = new Date().toISOString()

      const putRequest = objectStore.put(note)
      putRequest.onsuccess = () => resolve(true)
      putRequest.onerror = () => reject(new Error('Failed to update note size'))
    }

    getRequest.onerror = () => {
      reject(new Error('Failed to get note'))
    }
  })
}

export async function updateNotePosition(noteId: string, x: number, y: number): Promise<boolean> {
  if (!db) {
    await initDatabase()
  }

  return new Promise(async (resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const getRequest = objectStore.get(noteId)

    getRequest.onsuccess = () => {
      const note = getRequest.result
      if (!note) {
        reject(new Error('Note not found'))
        return
      }

      note.x = x
      note.y = y
      note.updated_at = new Date().toISOString()

      const putRequest = objectStore.put(note)
      putRequest.onsuccess = () => resolve(true)
      putRequest.onerror = () => reject(new Error('Failed to update note position'))
    }

    getRequest.onerror = () => {
      reject(new Error('Failed to get note'))
    }
  })
}

export async function autoArrangeNotes(): Promise<boolean> {
  if (!db) {
    await initDatabase()
  }

  return new Promise(async (resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    try {
      const notes = await getAllNotes()
      const cols = 6
      const gap = 16
      const noteWidth = 300
      const noteHeight = 150
      const padding = 24

      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const objectStore = transaction.objectStore(STORE_NAME)

      const updatePromises = notes.map((note, index) => {
        return new Promise<void>((resolveUpdate, rejectUpdate) => {
          const col = index % cols
          const rowNum = Math.floor(index / cols)
          const x = padding + col * (noteWidth + gap)
          const y = padding + rowNum * (noteHeight + gap)

          const getRequest = objectStore.get(note.id)
          getRequest.onsuccess = () => {
            const noteToUpdate = getRequest.result
            if (noteToUpdate) {
              noteToUpdate.x = x
              noteToUpdate.y = y
              noteToUpdate.updated_at = new Date().toISOString()
              const putRequest = objectStore.put(noteToUpdate)
              putRequest.onsuccess = () => resolveUpdate()
              putRequest.onerror = () => rejectUpdate(new Error('Failed to update note'))
            } else {
              resolveUpdate()
            }
          }
          getRequest.onerror = () => rejectUpdate(new Error('Failed to get note'))
        })
      })

      await Promise.all(updatePromises)
      resolve(true)
    } catch (error) {
      reject(error)
    }
  })
}

// Initialize database on module load
if (typeof window !== 'undefined') {
  initDatabase().then(() => {
    migrateFromOldDb()
  }).catch((error) => {
    console.error('Failed to initialize IndexedDB:', error)
  })
}
