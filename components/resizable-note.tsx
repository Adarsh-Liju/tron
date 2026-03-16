'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type Note } from '@/lib/db'
import { cn } from '@/lib/utils'

interface ResizableNoteProps {
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
  onResize: (noteId: string, width: number, height: number) => void
  onReorder: (noteIds: string[]) => void
  onDragStart?: (noteId: string) => void
  onDragEnd?: () => void
}

export function ResizableNote({
  note,
  noteIndex,
  boardId,
  boardIndex,
  focusedBoard,
  focusedNote,
  onFocus,
  onEdit,
  onDelete,
  onMove,
  onResize,
  onReorder,
  onDragStart,
  onDragEnd,
}: ResizableNoteProps) {
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 320, height: 150 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const noteRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const isFocused = boardIndex === focusedBoard && noteIndex === focusedNote

  useEffect(() => {
    // Load saved dimensions from localStorage
    const saved = localStorage.getItem(`note-${note.id}-dimensions`)
    if (saved) {
      try {
        const { width, height } = JSON.parse(saved)
        setDimensions({ width, height })
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [note.id])

  const handleDragStart = (e: React.DragEvent) => {
    setDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', JSON.stringify({ noteId: note.id, boardId, noteIndex }))
    
    if (onDragStart) {
      onDragStart(note.id)
    }
    
    // Create custom drag image
    const dragElement = e.currentTarget as HTMLElement
    const dragImage = dragElement.cloneNode(true) as HTMLElement
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.style.opacity = '0.8'
    dragImage.style.transform = 'rotate(2deg) scale(0.95)'
    dragImage.style.width = `${dimensions.width}px`
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, dimensions.width / 2, dimensions.height / 2)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragEnd = () => {
    setDragging(false)
    setDragOver(false)
    if (onDragEnd) {
      onDragEnd()
    }
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
    e.stopPropagation()
    setDragOver(false)
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/html'))
      if (data.noteId && data.noteId !== note.id) {
        if (data.boardId === boardId) {
          // Reorder within same board - get all note IDs and swap positions
          // This will be handled by the parent component
          onReorder([data.noteId, note.id])
        } else {
          // Move to different board
          onMove(data.noteId, boardId)
        }
      }
    } catch (err) {
      // Ignore parse errors
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = dimensions.width
    const startHeight = dimensions.height

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(600, startWidth + (e.clientX - startX)))
      const newHeight = Math.max(100, Math.min(500, startHeight + (e.clientY - startY)))
      const newDims = { width: newWidth, height: newHeight }
      setDimensions(newDims)
      localStorage.setItem(`note-${note.id}-dimensions`, JSON.stringify(newDims))
    }

    const handleMouseUp = () => {
      setResizing(false)
      onResize(note.id, dimensions.width, dimensions.height)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
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
      }}
      onDoubleClick={() => {
        onFocus(noteIndex)
        onEdit(noteIndex)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onFocus(noteIndex)
        onDelete(noteIndex)
      }}
      className={cn(
        'bg-[rgba(0,20,26,0.8)] border border-tron-cyan/30 p-4 cursor-grab active:cursor-grabbing transition-all relative break-words leading-relaxed font-mono text-sm select-none',
        'hover:shadow-[0_0_15px_rgba(0,234,255,0.4)] hover:border-tron-cyan/60 hover:bg-[rgba(0,20,26,0.95)]',
        'group',
        isFocused &&
          'border-tron-cyan border-l-tron-cyan shadow-[0_0_20px_rgba(0,234,255,0.6)] bg-[rgba(0,20,26,1)] ring-2 ring-tron-cyan/50',
        dragging && 'opacity-50 rotate-[2deg] scale-95 cursor-grabbing z-[1000] shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
        dragOver && 'border-t-2 border-t-dashed border-t-tron-cyan scale-105 bg-[rgba(0,234,255,0.1)]',
        resizing && 'select-none'
      )}
      style={{
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
        borderLeft: isFocused ? '3px solid #00eaff' : '3px solid transparent',
        transition: dragging || resizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        onMouseDown={handleResizeStart}
        className={cn(
          'absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity',
          'bg-tron-cyan/30 hover:bg-tron-cyan border-t border-l border-tron-cyan',
          resizing && 'opacity-100 bg-tron-cyan'
        )}
        style={{
          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
        }}
      >
        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-tron-cyan/50" />
      </div>

      {/* Content */}
      <div className="pr-4 pb-4 prose prose-invert prose-sm max-w-none text-tron-cyan/90 font-mono text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
            h1: ({ children }) => <h1 className="text-lg font-bold text-tron-cyan-light mb-2 [text-shadow:0_0_10px_#00eaff]">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-bold text-tron-cyan-light mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold text-tron-cyan-light mb-1">{children}</h3>,
            code: ({ children, className }) => {
              const isInline = !className
              return isInline ? (
                <code className="bg-tron-cyan/20 text-tron-cyan px-1 py-0.5 rounded text-xs">{children}</code>
              ) : (
                <code className="block bg-black/50 border border-tron-cyan/30 rounded p-2 my-2 overflow-x-auto text-xs">{children}</code>
              )
            },
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
            li: ({ children }) => <li className="text-tron-cyan/90">{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-tron-cyan pl-2 my-2 italic text-tron-cyan/80">{children}</blockquote>,
            a: ({ href, children }) => <a href={href} className="text-tron-cyan-light underline hover:text-tron-cyan" target="_blank" rel="noopener noreferrer">{children}</a>,
            strong: ({ children }) => <strong className="font-bold text-tron-cyan-light">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
          }}
        >
          {note.text}
        </ReactMarkdown>
      </div>

      {/* Drag indicator */}
      {dragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-tron-cyan/20 border-2 border-dashed border-tron-cyan rounded p-4 text-tron-cyan text-xs font-mono uppercase">
            Dragging...
          </div>
        </div>
      )}
    </div>
  )
}
