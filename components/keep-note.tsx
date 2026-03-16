'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type Note } from '@/lib/notes-db'
import { cn } from '@/lib/utils'
import { Card, CardContent } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { playClick, playTronBeep } from '@/lib/sounds'

interface KeepNoteProps {
  note: Note
  noteIndex: number
  focusedNote: number
  onFocus: (index: number) => void
  onEdit: (noteIndex: number) => void
  onDelete: (noteIndex: number) => void
  onResize: (noteId: string, width: number, height: number) => void
  onDragStart: (noteId: string, e: React.DragEvent) => void
  onDragEnd: () => void
}

export function KeepNote({
  note,
  noteIndex,
  focusedNote,
  onFocus,
  onEdit,
  onDelete,
  onResize,
  onDragStart,
  onDragEnd,
}: KeepNoteProps) {
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [dimensions, setDimensions] = useState({ 
    width: note.width || 300, 
    height: note.height || 150 
  })
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const isFocused = noteIndex === focusedNote

  useEffect(() => {
    setDimensions({ 
      width: note.width || 300, 
      height: note.height || 150 
    })
  }, [note.width, note.height])

  const handleDragStart = (e: React.DragEvent) => {
    setDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', note.id)
    onDragStart(note.id, e)
    
    const dragElement = e.currentTarget as HTMLElement
    const dragImage = dragElement.cloneNode(true) as HTMLElement
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.style.opacity = '0.6'
    dragImage.style.transform = 'rotate(3deg) scale(0.9)'
    dragImage.style.width = `${dimensions.width}px`
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, dimensions.width / 2, dimensions.height / 2)
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragEnd = () => {
    setDragging(false)
    onDragEnd()
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    setResizeDirection(direction)
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = dimensions.width
    const startHeight = dimensions.height
    const startLeft = (e.currentTarget as HTMLElement).getBoundingClientRect().left
    const startTop = (e.currentTarget as HTMLElement).getBoundingClientRect().top

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth
      let newHeight = startHeight
      
      if (direction.includes('e')) {
        newWidth = Math.max(200, Math.min(800, startWidth + (e.clientX - startX)))
      }
      if (direction.includes('w')) {
        const widthChange = startX - e.clientX
        newWidth = Math.max(200, Math.min(800, startWidth + widthChange))
      }
      if (direction.includes('s')) {
        newHeight = Math.max(100, Math.min(800, startHeight + (e.clientY - startY)))
      }
      if (direction.includes('n')) {
        const heightChange = startY - e.clientY
        newHeight = Math.max(100, Math.min(800, startHeight + heightChange))
      }
      
      const newDims = { width: newWidth, height: newHeight }
      setDimensions(newDims)
      onResize(note.id, newDims.width, newDims.height)
    }

    const handleMouseUp = () => {
      setResizing(false)
      setResizeDirection(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <Card
      ref={noteRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => {
        playClick()
        onFocus(noteIndex)
      }}
      onDoubleClick={() => {
        playTronBeep()
        onFocus(noteIndex)
        onEdit(noteIndex)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        playClick()
        onFocus(noteIndex)
        onDelete(noteIndex)
      }}
      className={cn(
        'bg-[rgba(0,20,26,0.9)] border border-tron-cyan/30 cursor-grab active:cursor-grabbing',
        'transition-all duration-200 break-words leading-relaxed font-mono text-sm select-none',
        'hover:border-tron-cyan hover:shadow-[0_0_20px_rgba(0,234,255,0.4)] hover:scale-[1.02]',
        'group relative p-0',
        isFocused && 'border-tron-cyan ring-2 ring-tron-cyan/50 shadow-[0_0_25px_rgba(0,234,255,0.6)]',
        dragging && 'opacity-50 rotate-3 scale-95 cursor-grabbing z-[1000] shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-jiggle',
        resizing && 'select-none'
      )}
      style={{
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
        transition: dragging || resizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Resize handles - all corners and edges */}
      {/* Top-left */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
        className={cn(
          'absolute top-0 left-0 w-5 h-5 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-r border-b border-tron-cyan/60',
          resizeDirection === 'nw' && 'opacity-100 bg-tron-cyan/70'
        )}
      />
      {/* Top */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'n')}
        className={cn(
          'absolute top-0 left-5 right-5 h-3 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-b border-tron-cyan/60',
          resizeDirection === 'n' && 'opacity-100 bg-tron-cyan/70'
        )}
      />
      {/* Top-right */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
        className={cn(
          'absolute top-0 right-0 w-5 h-5 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-l border-b border-tron-cyan/60',
          resizeDirection === 'ne' && 'opacity-100 bg-tron-cyan/70'
        )}
      />
      {/* Right */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'e')}
        className={cn(
          'absolute top-5 bottom-5 right-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-l border-tron-cyan/60',
          resizeDirection === 'e' && 'opacity-100 bg-tron-cyan/70'
        )}
      />
      {/* Bottom-right */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'se')}
        className={cn(
          'absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-t border-l border-tron-cyan/60',
          resizeDirection === 'se' && 'opacity-100 bg-tron-cyan/70'
        )}
        style={{
          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
        }}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 bg-tron-cyan/80" />
      </div>
      {/* Bottom */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 's')}
        className={cn(
          'absolute bottom-0 left-5 right-5 h-3 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-t border-tron-cyan/60',
          resizeDirection === 's' && 'opacity-100 bg-tron-cyan/70'
        )}
      />
      {/* Bottom-left */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
        className={cn(
          'absolute bottom-0 left-0 w-5 h-5 cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-r border-t border-tron-cyan/60',
          resizeDirection === 'sw' && 'opacity-100 bg-tron-cyan/70'
        )}
      />
      {/* Left */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'w')}
        className={cn(
          'absolute top-5 bottom-5 left-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10',
          'bg-tron-cyan/30 hover:bg-tron-cyan/50 border-r border-tron-cyan/60',
          resizeDirection === 'w' && 'opacity-100 bg-tron-cyan/70'
        )}
      />

      {/* Content */}
      <CardContent className="p-4">
        <ScrollArea className="h-full max-h-[calc(100vh-200px)]">
          <div className="pr-6 pb-6 prose prose-invert prose-sm max-w-none text-tron-cyan/90 font-mono text-sm">
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
        </ScrollArea>
      </CardContent>

      {/* Drag indicator */}
      {dragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-tron-cyan/10 rounded-lg">
          <div className="bg-tron-cyan/30 border-2 border-dashed border-tron-cyan rounded p-3 text-tron-cyan text-xs font-mono uppercase">
            Dragging...
          </div>
        </div>
      )}
    </Card>
  )
}
