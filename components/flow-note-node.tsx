'use client'

import { memo, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { type NodeProps } from '@xyflow/react'
import { type Note } from '@/lib/notes-db'
import { cn } from '@/lib/utils'
import { Card, CardContent } from './ui/card'
import { ScrollArea } from './ui/scroll-area'

export type NoteNodeData = {
  note: Note
  noteIndex: number
  isFocused: boolean
  onResize?: (noteId: string, width: number, height: number) => void
}

function FlowNoteNodeComponent({ data, selected }: NodeProps) {
  const { note, noteIndex, isFocused, onResize } = data as NoteNodeData
  const [dimensions, setDimensions] = useState({
    width: note.width || 300,
    height: note.height || 150,
  })
  const [resizing, setResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)

  useEffect(() => {
    setDimensions({
      width: note.width || 300,
      height: note.height || 150,
    })
  }, [note.width, note.height])

  const handleResizeStart = (e: React.MouseEvent, direction: string, onResize?: (noteId: string, w: number, h: number) => void) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    setResizeDirection(direction)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = dimensions.width
    const startHeight = dimensions.height

    const handleMouseMove = (ev: MouseEvent) => {
      let newWidth = startWidth
      let newHeight = startHeight

      if (direction.includes('e')) newWidth = Math.max(200, Math.min(800, startWidth + (ev.clientX - startX)))
      if (direction.includes('w')) newWidth = Math.max(200, Math.min(800, startWidth + (startX - ev.clientX)))
      if (direction.includes('s')) newHeight = Math.max(100, Math.min(800, startHeight + (ev.clientY - startY)))
      if (direction.includes('n')) newHeight = Math.max(100, Math.min(800, startHeight + (startY - ev.clientY)))

      setDimensions({ width: newWidth, height: newHeight })
      onResize?.(note.id, newWidth, newHeight)
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
      className={cn(
        'bg-[rgba(0,20,26,0.9)] border border-tron-cyan/30 cursor-grab active:cursor-grabbing',
        'transition-all duration-300 ease-out break-words leading-relaxed font-mono text-sm select-none',
        'hover:border-tron-cyan hover:shadow-[0_0_20px_rgba(0,234,255,0.4)]',
        'group relative p-0 overflow-visible',
        'shadow-lg',
        isFocused && 'border-tron-cyan ring-2 ring-tron-cyan/50 shadow-[0_0_25px_rgba(0,234,255,0.6)] scale-[1.02]',
        selected && 'border-tron-cyan ring-2 ring-tron-cyan/50 shadow-[0_0_25px_rgba(0,234,255,0.6)]',
        resizing && 'select-none'
      )}
      style={{
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
        transition: resizing ? 'none' : 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* Resize handles - nodrag so they don't trigger node drag */}
      {[
        { dir: 'nw', className: 'top-0 left-0 w-5 h-5 cursor-nwse-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-r border-b border-tron-cyan/60' },
        { dir: 'n', className: 'top-0 left-5 right-5 h-3 cursor-ns-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-b border-tron-cyan/60' },
        { dir: 'ne', className: 'top-0 right-0 w-5 h-5 cursor-nesw-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-l border-b border-tron-cyan/60' },
        { dir: 'e', className: 'top-5 bottom-5 right-0 w-3 cursor-ew-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-l border-tron-cyan/60' },
        { dir: 'se', className: 'bottom-0 right-0 w-6 h-6 cursor-nwse-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-t border-l border-tron-cyan/60', clip: 'polygon(100% 0, 0 100%, 100% 100%)' },
        { dir: 's', className: 'bottom-0 left-5 right-5 h-3 cursor-ns-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-t border-tron-cyan/60' },
        { dir: 'sw', className: 'bottom-0 left-0 w-5 h-5 cursor-nesw-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-r border-t border-tron-cyan/60' },
        { dir: 'w', className: 'top-5 bottom-5 left-0 w-3 cursor-ew-resize bg-tron-cyan/30 hover:bg-tron-cyan/50 border-r border-tron-cyan/60' },
      ].map(({ dir, className, clip }) => (
        <div
          key={dir}
          className={cn('nodrag nopan absolute opacity-0 group-hover:opacity-100 transition-opacity z-10', resizeDirection === dir && 'opacity-100 bg-tron-cyan/70', className)}
          style={clip ? { clipPath: clip } : undefined}
          onMouseDown={(e) => handleResizeStart(e, dir, onResize)}
        >
          {dir === 'se' && <div className="absolute bottom-1 right-1 w-2 h-2 bg-tron-cyan/80" />}
        </div>
      ))}

      <CardContent className="p-4 nodrag nopan">
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
    </Card>
  )
}

export const FlowNoteNode = memo(FlowNoteNodeComponent)
