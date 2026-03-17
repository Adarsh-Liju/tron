'use client'

import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  type NodeChange,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { FlowNoteNode } from './flow-note-node'
import { type Note } from '@/lib/notes-db'
import { playGridPulse, playClick } from '@/lib/sounds'

const nodeTypes = { note: FlowNoteNode }

interface KeepGridProps {
  notes: Note[]
  focusedNote: number
  onNoteFocus: (index: number) => void
  onEditNote: (noteIndex: number) => void
  onDeleteNote: (noteIndex: number) => void
  onResizeNote: (noteId: string, width: number, height: number) => void
  onUpdateNotePosition: (noteId: string, x: number, y: number) => void
  onAddNote?: () => void
}

function notesToNodes(
  notes: Note[],
  focusedNote: number,
  onResizeNote: (noteId: string, width: number, height: number) => void
): Node[] {
  return notes.map((note, index) => ({
    id: note.id,
    type: 'note',
    position: {
      x: note.x ?? 0,
      y: note.y ?? 0,
    },
    data: {
      note,
      noteIndex: index,
      isFocused: index === focusedNote,
      onResize: onResizeNote,
    },
    style: {
      width: note.width ?? 300,
      height: note.height ?? 150,
    },
    draggable: true,
  }))
}

export function KeepGrid({
  notes,
  focusedNote,
  onNoteFocus,
  onEditNote,
  onDeleteNote,
  onResizeNote,
  onUpdateNotePosition,
  onAddNote,
}: KeepGridProps) {
  const [nodes, setNodes] = useNodesState(notesToNodes(notes, focusedNote, onResizeNote))
  const [edges] = useEdgesState([])

  // Sync nodes when notes or focusedNote changes
  useEffect(() => {
    setNodes(notesToNodes(notes, focusedNote, onResizeNote))
  }, [notes, focusedNote, onResizeNote, setNodes])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds)
        for (const change of changes) {
          if (change.type === 'position' && change.dragging === false) {
            const node = updated.find((n) => n.id === change.id)
            if (node?.position) {
              onUpdateNotePosition(change.id, node.position.x, node.position.y)
            }
          }
        }
        return updated
      })
    },
    [setNodes, onUpdateNotePosition]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const index = notes.findIndex((n) => n.id === node.id)
      if (index >= 0) {
        playClick()
        onNoteFocus(index)
      }
    },
    [notes, onNoteFocus]
  )

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const index = notes.findIndex((n) => n.id === node.id)
      if (index >= 0) {
        onEditNote(index)
      }
    },
    [notes, onEditNote]
  )

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node) => {
      e.preventDefault()
      const index = notes.findIndex((n) => n.id === node.id)
      if (index >= 0) {
        onDeleteNote(index)
      }
    },
    [notes, onDeleteNote]
  )

  const onNodeDragStop = useCallback(() => {
    playGridPulse()
  }, [])

  // Empty state when no notes
  if (notes.length === 0) {
    return (
      <div
        className="relative overflow-auto flex-1 flex items-center justify-center"
        style={{ width: '100%', height: '100%' }}
      >
        <div
          onClick={onAddNote}
          className="cursor-pointer group relative border-2 border-dashed border-tron-cyan/30 rounded-lg p-12 max-w-md text-center transition-all duration-300 hover:border-tron-cyan hover:bg-[rgba(0,20,26,0.8)] hover:shadow-[0_0_30px_rgba(0,234,255,0.4)] hover:scale-105"
        >
          <span className="text-5xl">

          ⚡
          </span>
          {/* <div className="text-6xl mb-4 animate-pulse bg-transparent"></div> */}
          <h3 className="text-xl font-orbitron text-tron-cyan-light mb-2 uppercase tracking-wider [text-shadow:0_0_10px_#00eaff]">
            No Notes Yet
          </h3>
          <p className="text-tron-cyan/70 font-mono text-sm mb-4">
            Click here to create your first note
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tron-cyan/10 border border-tron-cyan/30 rounded text-tron-cyan text-xs font-mono uppercase tracking-wider group-hover:bg-tron-cyan/20 group-hover:border-tron-cyan transition-all">
            <span>+</span>
            <span>Add Note</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={() => {}}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDragStop={onNodeDragStop}
        fitView
        fitViewOptions={{
          padding: 0.2,
          duration: 500,
          minZoom: 0.5,
          maxZoom: 1.2,
        }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnDrag={[0, 1]}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        elevateNodesOnSelect
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
        style={{ background: 'transparent' }}
      >
        <Background
          color="rgba(0, 234, 255, 0.08)"
          gap={40}
          size={1}
          style={{ background: 'transparent' }}
        />
        <Controls
          className="!bg-[rgba(0,20,26,0.9)] !border-tron-cyan/30 !rounded-lg"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  )
}
