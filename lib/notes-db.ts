'use client'

import initSqlJs, { Database } from 'sql.js'
import { nanoid } from 'nanoid'

let db: Database | null = null
let SQL: typeof initSqlJs | null = null

// Initialize SQLite database
export async function initDatabase(): Promise<Database> {
  if (db) return db
  
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
  
  const savedDb = typeof window !== 'undefined' ? localStorage.getItem('tronNotesDb') : null
  
  if (savedDb) {
    try {
      const uint8Array = new Uint8Array(JSON.parse(savedDb))
      db = new SQL!.Database(uint8Array)
    } catch (parseError) {
      console.warn('Failed to parse saved database, creating new one:', parseError)
      db = new SQL!.Database()
      createTables()
      migrateFromOldDb()
    }
  } else {
    db = new SQL!.Database()
    createTables()
    migrateFromOldDb()
  }
  
  return db
}

function createTables() {
  if (!db) return
  
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      position INTEGER DEFAULT 0,
      width INTEGER DEFAULT 300,
      height INTEGER DEFAULT 150
    )
  `)
  
  db.run(`CREATE INDEX IF NOT EXISTS idx_notes_position ON notes(position)`)
  saveDatabase()
}

function migrateFromOldDb() {
  if (typeof window === 'undefined' || !db) return
  
  // Migrate from old board-based structure
  const oldDb = localStorage.getItem('tronDb')
  if (!oldDb) return
  
  try {
    const uint8Array = new Uint8Array(JSON.parse(oldDb))
    const oldDbInstance = new SQL!.Database(uint8Array)
    
    const boards = oldDbInstance.exec(`
      SELECT id FROM boards ORDER BY position ASC
    `)
    
    if (boards.length) {
      const boardId = boards[0].values[0][0] as string
      const notes = oldDbInstance.exec(`
        SELECT id, text, position 
        FROM notes 
        WHERE board_id = ? 
        ORDER BY position ASC
      `, [boardId])
      
      if (notes.length) {
        notes[0].values.forEach((row, index) => {
          db!.run(
            `INSERT OR REPLACE INTO notes (id, text, position) VALUES (?, ?, ?)`,
            [row[0], row[1], index]
          )
        })
        saveDatabase()
        console.log('Migrated notes from old database')
      }
    }
  } catch (error) {
    console.error('Migration error:', error)
  }
}

export function saveDatabase() {
  if (!db || typeof window === 'undefined') return
  
  try {
    const data = db.export()
    const buffer = Array.from(data)
    localStorage.setItem('tronNotesDb', JSON.stringify(buffer))
  } catch (error) {
    console.error('Failed to save database:', error)
  }
}

export interface Note {
  id: string
  text: string
  position: number
  width?: number
  height?: number
}

export function getAllNotes(): Note[] {
  if (!db) return []
  
  const notes = db.exec(`
    SELECT id, text, position, width, height 
    FROM notes 
    ORDER BY position ASC, created_at ASC
  `)
  
  if (!notes.length) return []
  
  return notes[0].values.map(row => ({
    id: row[0] as string,
    text: row[1] as string,
    position: row[2] as number || 0,
    width: row[3] as number || 300,
    height: row[4] as number || 150,
  }))
}

export function addNote(text: string): Note | null {
  if (!db) return null
  
  const id = nanoid()
  const positionResult = db.exec(`SELECT COALESCE(MAX(position), -1) + 1 as max_pos FROM notes`)
  const position = positionResult[0]?.values[0]?.[0] as number || 0
  
  db.run(
    `INSERT INTO notes (id, text, position, width, height) VALUES (?, ?, ?, ?, ?)`,
    [id, text, position, 300, 150]
  )
  
  saveDatabase()
  return { id, text, position, width: 300, height: 150 }
}

export function updateNote(id: string, text: string): boolean {
  if (!db) return false
  
  db.run(
    `UPDATE notes SET text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [text, id]
  )
  
  saveDatabase()
  return true
}

export function deleteNote(id: string): boolean {
  if (!db) return false
  
  db.run(`DELETE FROM notes WHERE id = ?`, [id])
  saveDatabase()
  return true
}

export function reorderNotes(noteIds: string[]): boolean {
  if (!db) return false
  
  noteIds.forEach((noteId, index) => {
    db!.run(
      `UPDATE notes SET position = ? WHERE id = ?`,
      [index, noteId]
    )
  })
  
  saveDatabase()
  return true
}

export function updateNoteSize(noteId: string, width: number, height: number): boolean {
  if (!db) return false
  
  db.run(
    `UPDATE notes SET width = ?, height = ? WHERE id = ?`,
    [width, height, noteId]
  )
  
  saveDatabase()
  return true
}
