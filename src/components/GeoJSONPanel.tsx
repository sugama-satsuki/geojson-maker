import { useEffect, useMemo, useRef, useState } from 'react'
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
}

export function GeoJSONPanel({ featureCollection, highlightedFeatureId, onFeatureClick }: GeoJSONPanelProps) {
  const jsonValue = useMemo(() => JSON.stringify(featureCollection, null, 2), [featureCollection])
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // ハイライトされたフィーチャへスクロール
  useEffect(() => {
    if (!highlightedFeatureId || !listRef.current) return
    const el = listRef.current.querySelector(`[data-feature-id="${highlightedFeatureId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [highlightedFeatureId])

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

  return (
    <div className='geojson-panel'>
      <div className='geojson-panel__header'>
        <div className='geojson-panel__title'>GeoJSON</div>
        <div className='geojson-panel__count'>{featureCollection.features.length}件</div>
      </div>

      {featureCollection.features.length > 0 && (
        <div className='geojson-panel__feature-list' ref={listRef}>
          {featureCollection.features.map((f, i) => {
            const fid = f.properties?._id as string | undefined
            if (!fid) return null
            const geomLabel = GEOM_TYPE_LABEL[f.geometry.type] ?? f.geometry.type
            const isHighlighted = fid === highlightedFeatureId
            return (
              <button
                key={fid}
                type='button'
                data-feature-id={fid}
                className={`geojson-panel__feature-item${isHighlighted ? ' geojson-panel__feature-item--highlighted' : ''}`}
                onClick={() => onFeatureClick(fid)}
              >
                <span className='geojson-panel__feature-index'>{i + 1}</span>
                <span className='geojson-panel__feature-type'>{geomLabel}</span>
              </button>
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
      </div>
    </div>
  )
}
