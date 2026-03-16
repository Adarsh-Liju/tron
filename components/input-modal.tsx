'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { MarkdownEditor } from './markdown-editor'
import { cn } from '@/lib/utils'

interface InputModalProps {
  open: boolean
  title: string
  defaultValue: string
  onConfirm: (value: string) => void
  onCancel: () => void
  markdown?: boolean
}

export function InputModal({ open, title, defaultValue, onConfirm, onCancel, markdown = false }: InputModalProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (open) {
      setValue(defaultValue)
    }
  }, [open, defaultValue])

  const handleSubmit = () => {
    onConfirm(value)
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className={cn(
        'bg-[rgba(0,19,24,0.98)] border-2 border-tron-cyan shadow-[0_0_30px_rgba(0,234,255,0.5)] backdrop-blur-md',
        markdown ? 'min-w-[600px] max-w-[800px] h-[600px]' : 'min-w-[400px] max-w-[600px]'
      )}>
        <DialogHeader>
          <DialogTitle className="text-tron-cyan-light font-orbitron uppercase tracking-wider">
            {title}
          </DialogTitle>
        </DialogHeader>
        {markdown ? (
          <div className="flex-1 min-h-0">
            <MarkdownEditor
              value={value}
              onChange={setValue}
              placeholder="Start typing markdown..."
              className="h-full"
            />
          </div>
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            placeholder="Enter text..."
            className="bg-black/50 border-2 border-tron-cyan/30 text-tron-cyan font-mono focus:border-tron-cyan focus:shadow-[0_0_15px_rgba(0,234,255,0.4)] mb-5"
            autoFocus
          />
        )}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-tron-cyan/30 text-tron-cyan/60 hover:border-tron-cyan hover:text-tron-cyan uppercase tracking-wider"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-transparent border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan/10 hover:shadow-[0_0_20px_rgba(0,234,255,0.6)] uppercase tracking-wider"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
