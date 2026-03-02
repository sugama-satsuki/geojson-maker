import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FeaturePropertiesEditor } from './FeaturePropertiesEditor'
import { parseGeoJSONImport } from '../lib/geojson-helpers'
import './GeoJSONPanel.css'

const GEOM_TYPE_LABEL: Record<string, string> = {
  Point: 'ポイント',
  LineString: 'ライン',
  Polygon: 'ポリゴン',
}

type GeoJSONPanelProps = {
  featureCollection: GeoJSON.FeatureCollection
  highlightedFeatureId: string | null
  onFeatureClick: (featureId: string) => void
  onUpdateFeatureProperties: (featureId: string, userProperties: Record<string, string>) => void
  onImportCSV: (text: string) => void
  onImportGeoJSON: (features: GeoJSON.Feature[], mode: 'replace' | 'merge') => void
  onShareURL: () => void
}

export function GeoJSONPanel({
  featureCollection,
  highlightedFeatureId,
  onFeatureClick,
  onUpdateFeatureProperties,
  onImportCSV,
  onImportGeoJSON,
  onShareURL,
}: GeoJSONPanelProps) {
  const jsonValue = useMemo(() => JSON.stringify(featureCollection, null, 2), [featureCollection])
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(null)
  const [isImportHovered, setIsImportHovered] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const csvFileInputRef = useRef<HTMLInputElement>(null)
  const geojsonFileInputRef = useRef<HTMLInputElement>(null)
  const importHoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // ハイライトされたフィーチャへスクロール
  useEffect(() => {
    if (!highlightedFeatureId || !listRef.current) return
    const el = listRef.current.querySelector(`[data-feature-id="${highlightedFeatureId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [highlightedFeatureId])

  // 展開中のフィーチャが削除されたら閉じる
  useEffect(() => {
    if (!expandedFeatureId) return
    const exists = featureCollection.features.some(
      (f) => f.properties?._id === expandedFeatureId,
    )
    if (!exists) setExpandedFeatureId(null)
  }, [featureCollection, expandedFeatureId])

  const copyToClipboard = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API is not available')
      }
      await navigator.clipboard.writeText(jsonValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (error) {
      console.error('GeoJSON のコピーに失敗しました', error)
    }
  }

  const downloadGeoJSON = () => {
    const blob = new Blob([jsonValue], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.geojson'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1600)
  }

  const handleCSVFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onImportCSV(reader.result as string)
    }
    reader.onerror = () => {
      console.error('CSV ファイルの読み込みに失敗しました', reader.error)
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
    reader.onerror = () => {
      console.error('GeoJSON ファイルの読み込みに失敗しました', reader.error)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [onImportGeoJSON])

  const handleFeatureItemClick = (fid: string) => {
    setExpandedFeatureId((prev) => (prev === fid ? null : fid))
    onFeatureClick(fid)
  }

  return (
    <div className='geojson-panel'>
      <div className='geojson-panel__header'>
        <div className='geojson-panel__header-left'>
          <div className='geojson-panel__title'>GeoJSON</div>
          <div className='geojson-panel__count'>feature：{featureCollection.features.length}件</div>
        </div>
        <div
          className='geojson-panel__import-wrapper'
          onMouseEnter={handleImportMouseEnter}
          onMouseLeave={handleImportMouseLeave}
          onFocus={handleImportMouseEnter}
          onBlur={handleImportMouseLeave}
        >
          <button
            type='button'
            className='geojson-panel__header-button'
            title='インポート'
            aria-label='インポート'
            aria-haspopup='true'
            aria-expanded={isImportHovered}
            onClick={() => setIsImportHovered((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
          {isImportHovered && (
            <div className='geojson-panel__import-popup' role='menu'>
              <button
                type='button'
                role='menuitem'
                className='geojson-panel__import-popup-btn'
                onClick={() => csvFileInputRef.current?.click()}
              >
                CSVインポート
              </button>
              <button
                type='button'
                role='menuitem'
                className='geojson-panel__import-popup-btn'
                onClick={() => geojsonFileInputRef.current?.click()}
              >
                GeoJSONインポート
              </button>
            </div>
          )}
        </div>
      </div>

      {featureCollection.features.length > 0 && (
        <div className='geojson-panel__feature-list' ref={listRef}>
          {featureCollection.features.map((f, i) => {
            const fid = f.properties?._id as string | undefined
            if (!fid) return null
            const geomLabel = GEOM_TYPE_LABEL[f.geometry.type] ?? f.geometry.type
            const isHighlighted = fid === highlightedFeatureId
            const isExpanded = fid === expandedFeatureId
            return (
              <div key={fid} className='geojson-panel__feature-wrapper'>
                <button
                  type='button'
                  data-feature-id={fid}
                  className={`geojson-panel__feature-item${isHighlighted ? ' geojson-panel__feature-item--highlighted' : ''}${isExpanded ? ' geojson-panel__feature-item--expanded' : ''}`}
                  onClick={() => handleFeatureItemClick(fid)}
                >
                  <span className='geojson-panel__expand-icon'>{isExpanded ? '▾' : '▸'}</span>
                  <span className='geojson-panel__feature-index'>{i + 1}</span>
                  <span className='geojson-panel__feature-type'>{geomLabel}</span>
                </button>
                {isExpanded && (
                  <FeaturePropertiesEditor
                    properties={f.properties}
                    onUpdate={(userProps) => onUpdateFeatureProperties(fid, userProps)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className='geojson-panel__textarea-wrapper'>
        <textarea
          readOnly
          value={jsonValue}
          className='geojson-panel__textarea'
        />
      </div>
      <div className='geojson-panel__buttons'>
        <button
            type='button'
            onClick={copyToClipboard}
            className={`geojson-panel__button${copied ? ' copied' : ''}`}
        >
            {copied ? 'コピー完了' : 'クリップボードにコピー'}
        </button>
        <button
            type='button'
            onClick={downloadGeoJSON}
            className={`geojson-panel__button${downloaded ? ' downloaded' : ''}`}
        >
            {downloaded ? 'ダウンロード完了' : 'geojsonをダウンロード'}
        </button>
        <div className='geojson-panel__separator' />
        <button
          type='button'
          onClick={onShareURL}
          aria-label='URLをコピー'
          className='geojson-panel__button geojson-panel__button--secondary'
        >
          URLをコピー
        </button>
      </div>
      <input ref={csvFileInputRef} type='file' accept='.csv' onChange={handleCSVFileChange} style={{ display: 'none' }} />
      <input ref={geojsonFileInputRef} type='file' accept='.geojson,.json' onChange={handleGeoJSONFileChange} style={{ display: 'none' }} />
    </div>
  )
}
