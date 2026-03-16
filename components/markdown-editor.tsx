'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  preview?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  preview = false,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(preview)
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex gap-2 mb-2 border-b border-tron-cyan/30 pb-2">
        <button
          onClick={() => setIsPreview(false)}
          className={cn(
            'px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all',
            !isPreview
              ? 'text-tron-cyan border-b-2 border-tron-cyan'
              : 'text-tron-cyan/50 hover:text-tron-cyan'
          )}
        >
          Edit
        </button>
        <button
          onClick={() => setIsPreview(true)}
          className={cn(
            'px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all',
            isPreview
              ? 'text-tron-cyan border-b-2 border-tron-cyan'
              : 'text-tron-cyan/50 hover:text-tron-cyan'
          )}
        >
          Preview
        </button>
      </div>

      {!isPreview ? (
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-full bg-black/50 border-2 border-tron-cyan/30 text-tron-cyan font-mono text-sm p-4',
            'focus:border-tron-cyan focus:shadow-[0_0_15px_rgba(0,234,255,0.4)] focus:outline-none',
            'resize-none leading-relaxed'
          )}
          style={{ minHeight: '200px' }}
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 bg-black/30 border-2 border-tron-cyan/30 rounded">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="text-tron-cyan/90 font-mono"
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-tron-cyan-light mb-4 mt-6 [text-shadow:0_0_10px_#00eaff]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold text-tron-cyan-light mb-3 mt-5 [text-shadow:0_0_10px_#00eaff]">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-bold text-tron-cyan-light mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                code: ({ children, className }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="bg-tron-cyan/20 text-tron-cyan px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-black/50 border border-tron-cyan/30 rounded p-3 my-3 overflow-x-auto">
                      {children}
                    </code>
                  )
                },
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>
                ),
                li: ({ children }) => <li className="text-tron-cyan/90">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-tron-cyan pl-4 my-3 italic text-tron-cyan/80">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-tron-cyan-light underline hover:text-tron-cyan transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-tron-cyan-light">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {localValue || '*No content*'}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
