import { useCallback, useEffect, useRef, useState } from 'react'
import { DrawMode, DrawModeSelector } from './DrawModeSelector'
import { clampPosition } from '../lib/clamp-position'
import { parseGeoJSONImport } from '../lib/geojson-helpers'
import './DrawControlPanel.css'

type DrawControlPanelProps = {
  drawMode: DrawMode | null
  isDrawingPath: boolean
  canFinalizeDraft: boolean
  hasSelectedFeature: boolean
  onChangeMode: (mode: DrawMode | null) => void
  onFinalize: () => void
  onDeleteFeature: () => void
  onResetGeoJSON: () => void
  onShareURL: () => void
  onImportCSV: (text: string) => void
  onImportGeoJSON: (features: GeoJSON.Feature[], mode: 'replace' | 'merge') => void
}

const INITIAL_POSITION = { x: 10, y: 54 }

export function DrawControlPanel({
  drawMode,
  isDrawingPath,
  canFinalizeDraft,
  hasSelectedFeature,
  onChangeMode,
  onFinalize,
  onDeleteFeature,
  onResetGeoJSON,
  onShareURL,
  onImportCSV,
  onImportGeoJSON,
}: DrawControlPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(INITIAL_POSITION)
  const isDraggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [isImportHovered, setIsImportHovered] = useState(false)
  const importHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const csvFileInputRef = useRef<HTMLInputElement>(null)
  const geojsonFileInputRef = useRef<HTMLInputElement>(null)

  const handleImportMouseEnter = useCallback(() => {
    if (importHoverTimerRef.current) {
      clearTimeout(importHoverTimerRef.current)
      importHoverTimerRef.current = null
    }
    setIsImportHovered(true)
  }, [])

  const handleImportMouseLeave = useCallback(() => {
    importHoverTimerRef.current = setTimeout(() => {
      setIsImportHovered(false)
      importHoverTimerRef.current = null
    }, 200)
  }, [])

  const onGripMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }, [position])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !panelRef.current) return
      const raw = {
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      }
      const rect = panelRef.current.getBoundingClientRect()
      const clamped = clampPosition(
        raw,
        { width: rect.width, height: rect.height },
        { width: window.innerWidth, height: window.innerHeight },
      )
      setPosition(clamped)
    }

    const onMouseUp = () => {
      isDraggingRef.current = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleCSVFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onImportCSV(reader.result as string)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [onImportCSV])

  const handleGeoJSONFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const features = parseGeoJSONImport(reader.result as string)
        const replace = window.confirm('既存のフィーチャを置き換えますか？\n「OK」→ 置換\n「キャンセル」→ マージ（追加）')
        onImportGeoJSON(features, replace ? 'replace' : 'merge')
      } catch (err) {
        console.error('GeoJSON のインポートに失敗しました', err)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [onImportGeoJSON])

  return (
    <div
      ref={panelRef}
      className='draw-control-panel'
      style={{ left: position.x, top: position.y }}
    >
      <div
        className='draw-control-panel__grip'
        onMouseDown={onGripMouseDown}
        title='ドラッグで移動'
      >
        <svg viewBox="0 0 24 8" fill="currentColor">
          <circle cx="6" cy="2" r="1.5" />
          <circle cx="12" cy="2" r="1.5" />
          <circle cx="18" cy="2" r="1.5" />
          <circle cx="6" cy="6" r="1.5" />
          <circle cx="12" cy="6" r="1.5" />
          <circle cx="18" cy="6" r="1.5" />
        </svg>
      </div>
      <DrawModeSelector selectedMode={drawMode} onChange={onChangeMode} />
      {isDrawingPath && (
        <button
          type='button'
          onClick={onFinalize}
          disabled={!canFinalizeDraft}
          title='ドラフトを確定'
          className={`draw-control-panel__action-button draw-control-panel__action-button--confirm${canFinalizeDraft ? '' : ' draw-control-panel__action-button--disabled'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      )}
      <div className='draw-control-panel__separator' />
      <button
        type='button'
        onClick={onDeleteFeature}
        disabled={!hasSelectedFeature}
        title='追加した地物をクリックして削除'
        className={`draw-control-panel__action-button draw-control-panel__action-button--delete${hasSelectedFeature ? '' : ' draw-control-panel__action-button--disabled'}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
      <button
        type='button'
        onClick={onResetGeoJSON}
        title='GeoJSONを初期化'
        aria-label='GeoJSONを初期化'
        className='draw-control-panel__action-button draw-control-panel__action-button--reset'
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
      <button
        type='button'
        onClick={onShareURL}
        title='URLをコピー'
        aria-label='URLをコピー'
        className='draw-control-panel__action-button draw-control-panel__action-button--share'
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
      <div className='draw-control-panel__separator' />
      <div
        className='draw-control-panel__import-wrapper'
        onMouseEnter={handleImportMouseEnter}
        onMouseLeave={handleImportMouseLeave}
      >
        <button
          type='button'
          title='インポート'
          aria-label='インポート'
          className='draw-control-panel__action-button draw-control-panel__action-button--import'
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        {isImportHovered && (
          <div className='draw-control-panel__import-popup'>
            <button
              type='button'
              className='draw-control-panel__import-popup-btn'
              onClick={() => csvFileInputRef.current?.click()}
            >
              CSVインポート
            </button>
            <button
              type='button'
              className='draw-control-panel__import-popup-btn'
              onClick={() => geojsonFileInputRef.current?.click()}
            >
              GeoJSONインポート
            </button>
          </div>
        )}
      </div>
      <input ref={csvFileInputRef} type='file' accept='.csv' onChange={handleCSVFileChange} style={{ display: 'none' }} />
      <input ref={geojsonFileInputRef} type='file' accept='.geojson,.json' onChange={handleGeoJSONFileChange} style={{ display: 'none' }} />
    </div>
  )
}
