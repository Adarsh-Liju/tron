'use client'

import initSqlJs, { Database } from 'sql.js'
import { nanoid } from 'nanoid'

let db: Database | null = null
let SQL: typeof initSqlJs | null = null

// Initialize SQLite database
export async function initDatabase(): Promise<Database> {
  if (db) return db
  
  // Try multiple sources for WASM file
  const wasmSources = [
    {
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) {
          return 'https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/sql-wasm.wasm'
        }
        return `https://cdn.jsdelivr.net/npm/sql.js@1.14.1/dist/${file}`
      }
    },
    {
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) {
          return 'https://unpkg.com/sql.js@1.14.1/dist/sql-wasm.wasm'
        }
        return `https://unpkg.com/sql.js@1.14.1/dist/${file}`
      }
    },
    {
      locateFile: (file: string) => {
        if (file.endsWith('.wasm')) {
          return '/sql-wasm.wasm'
        }
        return `/${file}`
      }
    }
  ]
  
  let initError: Error | null = null
  
  for (const config of wasmSources) {
    try {
      SQL = await initSqlJs(config)
      console.log('Successfully initialized sql.js')
      break
    } catch (error) {
      initError = error as Error
      console.warn('Failed to initialize sql.js with config:', error)
      continue
    }
  }
  
  if (!SQL) {
    throw initError || new Error('Failed to initialize sql.js from all sources')
  }
  
  // Try to load existing database from localStorage
  const savedDb = typeof window !== 'undefined' ? localStorage.getItem('tronDb') : null
  
  if (savedDb) {
    try {
      const uint8Array = new Uint8Array(JSON.parse(savedDb))
      db = new SQL!.Database(uint8Array)
    } catch (parseError) {
      console.warn('Failed to parse saved database, creating new one:', parseError)
      db = new SQL!.Database()
      createTables()
      migrateFromLocalStorage()
    }
  } else {
    db = new SQL!.Database()
    createTables()
    migrateFromLocalStorage()
  }
  
  return db
}

// Create database tables
function createTables() {
  if (!db) return
  
  db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      position INTEGER DEFAULT 0
    )
  `)
  
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    )
  `)
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_board_id ON notes(board_id)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_position ON notes(position)`)
  db.run(`CREATE INDEX IF NOT EXISTS idx_boards_position ON boards(position)`)
  
  saveDatabase()
}

// Migrate data from localStorage if it exists
function migrateFromLocalStorage() {
  if (typeof window === 'undefined') return
  
  const oldData = localStorage.getItem('tronBoards')
  if (!oldData) return
  
  try {
    const boards = JSON.parse(oldData)
    
    boards.forEach((board: any, index: number) => {
      const boardId = board.id || nanoid()
      db!.run(
        `INSERT OR REPLACE INTO boards (id, name, position) VALUES (?, ?, ?)`,
        [boardId, board.name, index]
      )
      
      if (board.notes && Array.isArray(board.notes)) {
        board.notes.forEach((note: any, noteIndex: number) => {
          db!.run(
            `INSERT OR REPLACE INTO notes (id, board_id, text, position) VALUES (?, ?, ?, ?)`,
            [note.id || nanoid(), boardId, note.text, noteIndex]
          )
        })
      }
    })
    
    saveDatabase()
    localStorage.removeItem('tronBoards')
    console.log('Migrated data from localStorage to SQLite')
  } catch (error) {
    console.error('Migration error:', error)
  }
}

// Save database to localStorage
export function saveDatabase() {
  if (!db || typeof window === 'undefined') return
  
  try {
    const data = db.export()
    const buffer = Array.from(data)
    localStorage.setItem('tronDb', JSON.stringify(buffer))
  } catch (error) {
    console.error('Failed to save database:', error)
  }
}

export interface Board {
  id: string
  name: string
  position: number
  notes: Note[]
}

export interface Note {
  id: string
  text: string
  position: number
}

// Get all boards with their notes
export function getAllBoards(): Board[] {
  if (!db) return []
  
  const boards = db.exec(`
    SELECT id, name, position 
    FROM boards 
    ORDER BY position ASC, created_at ASC
  `)
  
  if (!boards.length) return []
  
  const boardsData: Board[] = boards[0].values.map(row => ({
    id: row[0] as string,
    name: row[1] as string,
    position: row[2] as number || 0,
    notes: []
  }))
  
  boardsData.forEach(board => {
    const notes = db!.exec(`
      SELECT id, text, position 
      FROM notes 
      WHERE board_id = ? 
      ORDER BY position ASC, created_at ASC
    `, [board.id])
    
    if (notes.length) {
      board.notes = notes[0].values.map(row => ({
        id: row[0] as string,
        text: row[1] as string,
        position: row[2] as number || 0
      }))
    }
  })
  
  return boardsData
}

// Add a new board
export function addBoard(name: string): Board | null {
  if (!db) return null
  
  const id = nanoid()
  const positionResult = db.exec(`SELECT COALESCE(MAX(position), -1) + 1 as max_pos FROM boards`)
  const position = positionResult[0]?.values[0]?.[0] as number || 0
  
  db.run(
    `INSERT INTO boards (id, name, position) VALUES (?, ?, ?)`,
    [id, name, position]
  )
  
  saveDatabase()
  return { id, name, notes: [], position }
}

// Update board name
export function updateBoard(id: string, name: string): boolean {
  if (!db) return false
  
  db.run(
    `UPDATE boards SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [name, id]
  )
  
  saveDatabase()
  return true
}

// Delete board
export function deleteBoard(id: string): boolean {
  if (!db) return false
  
  db.run(`DELETE FROM notes WHERE board_id = ?`, [id])
  db.run(`DELETE FROM boards WHERE id = ?`, [id])
  
  saveDatabase()
  return true
}

// Add a note to a board
export function addNote(boardId: string, text: string): Note | null {
  if (!db) return null
  
  const id = nanoid()
  const positionResult = db.exec(`SELECT COALESCE(MAX(position), -1) + 1 as max_pos FROM notes WHERE board_id = ?`, [boardId])
  const position = positionResult[0]?.values[0]?.[0] as number || 0
  
  db.run(
    `INSERT INTO notes (id, board_id, text, position) VALUES (?, ?, ?, ?)`,
    [id, boardId, text, position]
  )
  
  saveDatabase()
  return { id, text, position }
}

// Update note text
export function updateNote(id: string, text: string): boolean {
  if (!db) return false
  
  db.run(
    `UPDATE notes SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [text, id]
  )
  
  saveDatabase()
  return true
}

// Delete note
export function deleteNote(id: string): boolean {
  if (!db) return false
  
  db.run(`DELETE FROM notes WHERE id = ?`, [id])
  saveDatabase()
  return true
}

// Move note to different board
export function moveNoteToBoard(noteId: string, targetBoardId: string): boolean {
  if (!db) return false
  
  const positionResult = db.exec(`SELECT COALESCE(MAX(position), -1) + 1 as max_pos FROM notes WHERE board_id = ?`, [targetBoardId])
  const position = positionResult[0]?.values[0]?.[0] as number || 0
  
  db.run(
    `UPDATE notes SET board_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [targetBoardId, position, noteId]
  )
  
  saveDatabase()
  return true
}

// Reorder notes within a board
export function reorderNotes(boardId: string, noteIds: string[]): boolean {
  if (!db) return false
  
  noteIds.forEach((noteId, index) => {
    db!.run(
      `UPDATE notes SET position = ? WHERE id = ? AND board_id = ?`,
      [index, noteId, boardId]
    )
  })
  
  saveDatabase()
  return true
}

// Reorder boards
export function reorderBoards(boardIds: string[]): boolean {
  if (!db) return false
  
  boardIds.forEach((boardId, index) => {
    db!.run(
      `UPDATE boards SET position = ? WHERE id = ?`,
      [index, boardId]
    )
  })
  
  saveDatabase()
  return true
}
