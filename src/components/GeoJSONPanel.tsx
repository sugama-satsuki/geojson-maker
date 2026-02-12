import { useMemo, useState } from 'react'
import './GeoJSONPanel.css'

type GeoJSONPanelProps = {
  featureCollection: GeoJSON.FeatureCollection
}

export function GeoJSONPanel({ featureCollection }: GeoJSONPanelProps) {
  const jsonValue = useMemo(() => JSON.stringify(featureCollection, null, 2), [featureCollection])
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

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
        <div className='geojson-panel__count'>feature：{featureCollection.features.length}件</div>
      </div>
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
