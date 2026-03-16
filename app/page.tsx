'use client'

import { useEffect, useState } from 'react'
import { KeepApp } from '@/components/keep-app'
import { initDatabase } from '@/lib/notes-db'

export default function Home() {
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    initDatabase()
      .then(() => {
        setDbReady(true)
      })
      .catch((error) => {
        console.error('Failed to initialize database:', error)
        setDbReady(true) // Still render app even if DB fails
      })
  }, [])

  if (!dbReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-tron-cyan animate-pulse">Initializing TRON...</div>
      </div>
    )
  }

  return <KeepApp />
}
