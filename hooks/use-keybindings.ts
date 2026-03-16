'use client'

import { useEffect } from 'react'

interface Keybindings {
  [key: string]: (e: KeyboardEvent) => void
}

export function useKeybindings(keybindings: Keybindings) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') {
          const handler = keybindings['Escape']
          if (handler) {
            handler(e)
          }
        }
        return
      }

      // Handle Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        const combo = `Ctrl+${e.key.toLowerCase()}`
        const handler = keybindings[combo]
        if (handler) {
          e.preventDefault()
          handler(e)
          return
        }
      }

      // Handle regular keys
      const handler = keybindings[e.key]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keybindings])
}
