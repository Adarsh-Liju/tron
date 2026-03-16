'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { cn } from '@/lib/utils'

interface Command {
  name: string
  key: string
  action: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  commands: Command[]
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.key.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, filteredCommands, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[400px] max-w-[600px] bg-[rgba(0,19,24,0.98)] border-2 border-tron-cyan shadow-[0_0_30px_rgba(0,234,255,0.5)] backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-tron-cyan-light font-orbitron uppercase tracking-wider">
            Command Palette
          </DialogTitle>
        </DialogHeader>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(0)
          }}
          placeholder="Type command or press key..."
          className="bg-black/50 border-2 border-tron-cyan/30 text-tron-cyan font-mono focus:border-tron-cyan focus:shadow-[0_0_15px_rgba(0,234,255,0.4)]"
          autoFocus
        />
        <ScrollArea className="max-h-[300px]">
          {filteredCommands.map((cmd, idx) => (
            <div
              key={cmd.name}
              onClick={() => {
                cmd.action()
                onClose()
              }}
              className={cn(
                'p-2.5 cursor-pointer border border-transparent transition-all flex justify-between items-center',
                idx === selectedIndex &&
                  'bg-tron-cyan/10 border-tron-cyan'
              )}
            >
              <span className="text-tron-cyan">{cmd.name}</span>
              <kbd className="bg-tron-cyan/20 border border-tron-cyan px-1.5 py-0.5 rounded text-[10px] uppercase opacity-70">
                {cmd.key}
              </kbd>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
