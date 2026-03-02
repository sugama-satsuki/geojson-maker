import { useEffect, useRef, useState, useCallback } from 'react'
import type { StyleSpecification } from 'maplibre-gl'
import { useGeoloniaMap } from '../hooks/useGeoloniaMap'
import { DrawControlPanel, useDrawingEngine, VertexContextMenu, canDeleteVertex } from '../drawing-engine'
import { GeoJSONPanel } from './GeoJSONPanel'
import { FeatureContextMenu } from './FeatureContextMenu'
import { AddressSearchBar } from './AddressSearchBar'
import { AppLogo } from './AppLogo'
import { HelpSidebar } from './HelpSidebar'
import { getFeatureCenter } from '../lib/feature-center'
import { mergeUserProperties } from '../lib/property-helpers'
import { encodeFeaturesToURL, decodeURLToFeatures, URL_SIZE_WARNING_CHARS } from '../lib/url-helpers'
import './MapView.css'

const MAP_STYLE = 'geolonia/basic'

export const MapView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const map = useGeoloniaMap(containerRef, {
    center: [139.7670, 35.6814],
    zoom: 14,
    minZoom: 2,
    maxZoom: 19,
    style: MAP_STYLE as unknown as StyleSpecification
  })

  // URL パラメータからフィーチャを初期ロード
  const [initialFeatures] = useState(() => decodeURLToFeatures())

  const engine = useDrawingEngine(map, {
    initialFeatures: initialFeatures ?? undefined,
  })

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const featuresRef = useRef(engine.features)
  featuresRef.current = engine.features

  const handleCopy = useCallback((result: { message: string; type: 'success' | 'error' }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(result)
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 1500)
  }, [])

  const copyShareURL = useCallback(() => {
    if (featuresRef.current.features.length === 0) {
      handleCopy({ message: 'フィーチャがありません', type: 'error' })
      return
    }
    const url = encodeFeaturesToURL(featuresRef.current)
    if (url.length > URL_SIZE_WARNING_CHARS) {
      handleCopy({ message: 'URLが長くなりすぎる可能性があります', type: 'error' })
      return
    }
    navigator.clipboard.writeText(url)
      .then(() => handleCopy({ message: 'URLをコピーしました', type: 'success' }))
      .catch(() => handleCopy({ message: 'コピーに失敗しました', type: 'error' }))
  }, [handleCopy])

  const updateFeatureProperties = useCallback((featureId: string, userProperties: Record<string, string>) => {
    engine.setFeatures((prev) => ({
      ...prev,
      features: prev.features.map((f) => {
        if (f.properties?._id !== featureId) return f
        return { ...f, properties: mergeUserProperties(f.properties, userProperties) }
      }),
    }))
  }, [engine.setFeatures])

  const handlePanelFeatureClick = useCallback((featureId: string) => {
    const feature = engine.features.features.find((f) => f.properties?._id === featureId)
    if (!feature || !map) return
    const center = getFeatureCenter(feature)
    if (center) map.flyTo({ center, duration: 300 })
    engine.setSelectedFeatureIds(new Set([featureId]))
  }, [engine.features, map, engine.setSelectedFeatureIds])

  const handleAddressSearch = useCallback((lat: number, lng: number) => {
    if (!map) return
    map.flyTo({ center: [lng, lat], zoom: 16 })
  }, [map])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        className='map'
        ref={containerRef}
        data-lang='ja'
        data-gesture-handling='off'
        data-navigation-control='off'
        data-scale-control='on'
        style={{ width: 'calc(100% - 360px)', height: '100%' }}
      />

      {/* ラバーバンド選択の視覚表示 */}
      {engine.rubberBand && (
        <div
          style={{
            position: 'absolute',
            left: engine.rubberBand.x,
            top: engine.rubberBand.y,
            width: engine.rubberBand.width,
            height: engine.rubberBand.height,
            border: '2px dashed #1a73e8',
            background: 'rgba(26, 115, 232, 0.08)',
            pointerEvents: 'none',
          }}
        />
      )}

      <AppLogo />

      <AddressSearchBar onSearch={handleAddressSearch} />

      <DrawControlPanel
        {...engine.controlPanelProps}
      />

      <GeoJSONPanel
        featureCollection={engine.features}
        highlightedFeatureId={engine.highlightedPanelFeatureId}
        onFeatureClick={handlePanelFeatureClick}
        onUpdateFeatureProperties={updateFeatureProperties}
        onImportCSV={engine.importCSV}
        onImportGeoJSON={engine.importGeoJSON}
        onShareURL={copyShareURL}
      />

      {engine.contextMenuEvent && (
        <FeatureContextMenu
          feature={engine.contextMenuEvent.feature}
          position={{ x: engine.contextMenuEvent.x, y: engine.contextMenuEvent.y }}
          onClose={engine.closeContextMenu}
          onCopy={handleCopy}
        />
      )}

      {engine.vertexContextMenuEvent && (() => {
        const vtx = engine.vertexContextMenuEvent
        const feature = engine.features.features.find((f) => f.properties?._id === vtx.featureId)
        return (
          <VertexContextMenu
            position={{ x: vtx.x, y: vtx.y }}
            canDelete={feature ? canDeleteVertex(feature) : false}
            onDelete={() => { engine.deleteSelectedVertex(); engine.closeVertexContextMenu() }}
            onClose={engine.closeVertexContextMenu}
          />
        )
      })()}

      {engine.draftContextMenuEvent && (
        <VertexContextMenu
          position={{ x: engine.draftContextMenuEvent.x, y: engine.draftContextMenuEvent.y }}
          canDelete={true}
          onDelete={() => engine.deleteDraftPoint(engine.draftContextMenuEvent!.draftIndex)}
          onClose={engine.closeDraftContextMenu}
        />
      )}

      {toast && (
        <div className={`map-toast map-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <HelpSidebar isOpen={isHelpOpen} onOpen={() => setIsHelpOpen(true)} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
