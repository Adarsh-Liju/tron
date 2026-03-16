'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="min-w-[350px] bg-[rgba(0,19,24,0.98)] border-2 border-tron-cyan shadow-[0_0_30px_rgba(0,234,255,0.5)] backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-tron-cyan-light font-orbitron uppercase tracking-wider">
            {title}
          </DialogTitle>
          <DialogDescription className="text-tron-cyan font-mono text-sm leading-relaxed p-3 bg-tron-cyan/5 border-l-4 border-tron-cyan">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-tron-cyan/30 text-tron-cyan/60 hover:border-tron-cyan hover:text-tron-cyan uppercase tracking-wider"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-transparent border-2 border-[#ff0066] text-[#ff0066] hover:bg-[#ff0066]/10 hover:shadow-[0_0_20px_rgba(255,0,102,0.5)] uppercase tracking-wider"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
