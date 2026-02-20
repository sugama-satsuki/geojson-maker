import { useEffect, useRef, useState, useCallback } from 'react'
import { useUndoable } from '../hooks/useUndoable'
import type maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import { useGeoloniaMap } from '../hooks/useGeoloniaMap'
import { DrawMode } from './DrawModeSelector'
import { DrawControlPanel } from './DrawControlPanel'
import { GeoJSONPanel } from './GeoJSONPanel'
import { FeatureContextMenu } from './FeatureContextMenu'
import { AddressSearchBar } from './AddressSearchBar'
import { AppLogo } from './AppLogo'
import { HelpModal } from './HelpModal'
import { createPointFeature, createPathFeature, createDraftFeatureCollection, nextFeatureId } from '../lib/geojson-helpers'
import { getFeatureCenter } from '../lib/feature-center'
import { parseCSV } from '../lib/csv-helpers'
import { mergeUserProperties } from '../lib/property-helpers'
import { encodeFeaturesToURL, decodeURLToFeatures, URL_SIZE_WARNING_CHARS } from '../lib/url-helpers'
import { useVertexEditing, VERTEX_LAYER_ID } from '../hooks/useVertexEditing'
import './MapView.css'

export type FeatureCollection = GeoJSON.FeatureCollection

const MAP_STYLE = 'geolonia/basic'
const SOURCE_ID = 'geojson-maker-generated-features'
const POINT_LAYER_ID = 'geojson-maker-point-layer'
const SYMBOL_LAYER_ID = 'geojson-maker-symbol-layer'
const LINE_LAYER_ID = 'geojson-maker-line-layer'
const POLYGON_LAYER_ID = 'geojson-maker-polygon-layer'
const DRAFT_SOURCE_ID = 'geojson-maker-draft'
const DRAFT_LINE_LAYER_ID = 'geojson-maker-draft-line'
const DRAFT_POINT_LAYER_ID = 'geojson-maker-draft-point'
const DRAFT_POLYGON_LAYER_ID = 'geojson-maker-draft-polygon'
const HIGHLIGHT_SOURCE_ID = 'geojson-maker-highlight'
const HIGHLIGHT_POINT_LAYER_ID = 'geojson-maker-highlight-point'
const HIGHLIGHT_LINE_LAYER_ID = 'geojson-maker-highlight-line'
const HIGHLIGHT_POLYGON_LAYER_ID = 'geojson-maker-highlight-polygon'

const CLICKABLE_LAYERS = [POINT_LAYER_ID, SYMBOL_LAYER_ID, LINE_LAYER_ID, POLYGON_LAYER_ID]
const HIGHLIGHT_DURATION_MS = 1500

type PathMode = Extract<DrawMode, 'line' | 'polygon'>

export const MapView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const map = useGeoloniaMap(containerRef, {
    center: [139.7670, 35.6814],
    zoom: 14,
    minZoom: 2,
    maxZoom: 19,
    style: MAP_STYLE as unknown as StyleSpecification
  })

  const [drawMode, setDrawMode] = useState<DrawMode | null>('point')
  const {
    current: features,
    set: setFeatures,
    undo: undoFeatures,
    redo: redoFeatures,
    canUndo,
    canRedo,
  } = useUndoable<FeatureCollection>({ type: 'FeatureCollection', features: [] })
  const [draftCoords, setDraftCoords] = useState<[number, number][]>([])
  /** 選択中のフィーチャ ID セット（マルチ選択対応） */
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set())
  const [highlightedPanelFeatureId, setHighlightedPanelFeatureId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ feature: GeoJSON.Feature; x: number; y: number } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  /** ラバーバンド選択の視覚表示用 */
  const [rubberBand, setRubberBand] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const featuresRef = useRef(features)
  featuresRef.current = features
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** ラバーバンド中フラグ（click イベントで選択解除されるのを防ぐ） */
  const wasRubberBandingRef = useRef(false)
  /** ラバーバンドドラッグ状態（maplibre イベントハンドラ内で参照） */
  const rbDragRef = useRef<{ startPoint: { x: number; y: number }; isActive: boolean } | null>(null)
  const drawModeRef = useRef(drawMode)
  drawModeRef.current = drawMode

  const isDrawingPath = drawMode === 'line' || drawMode === 'polygon'
  const requiredVertices = drawMode === 'polygon' ? 3 : 2
  const canFinalizeDraft = isDrawingPath && draftCoords.length >= requiredVertices

  // 一時ハイライトを設定するヘルパー
  const flashHighlight = useCallback((featureId: string, setter: (id: string | null) => void) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current)
    setter(featureId)
    highlightTimerRef.current = setTimeout(() => {
      setter(null)
      highlightTimerRef.current = null
    }, HIGHLIGHT_DURATION_MS)
  }, [])

  // 頂点移動をコミット
  const updateFeatureVertex = useCallback((updatedFeature: GeoJSON.Feature) => {
    setFeatures((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.properties?._id === updatedFeature.properties?._id ? updatedFeature : f
      ),
    }))
  }, [])

  // 単一選択時のみ頂点編集を有効にする（マルチ選択時は無効）
  const selectedFeatureId = selectedFeatureIds.size === 1 ? [...selectedFeatureIds][0] : null

  const { justDraggedRef } = useVertexEditing({
    map,
    features,
    selectedFeatureId,
    mainSourceId: SOURCE_ID,
    onCommit: updateFeatureVertex,
  })

  useEffect(() => {
    setDraftCoords([])
    setSelectedFeatureIds(new Set())
    setContextMenu(null)
  }, [drawMode])

  useEffect(() => {
    if (!map) return
    if (map.getSource(SOURCE_ID)) return

    map.addSource(SOURCE_ID, { type: 'geojson', data: features })

    map.addLayer({
      id: POLYGON_LAYER_ID,
      type: 'fill',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'Polygon']],
      paint: { 'fill-color': '#e86a4a', 'fill-opacity': 0.2 }
    })
    map.addLayer({
      id: LINE_LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'LineString']],
      paint: { 'line-color': '#e86a4a', 'line-width': 3 }
    })
    map.addLayer({
      id: SYMBOL_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'drawMode'], 'symbol']],
      paint: { 'circle-radius': 7, 'circle-color': '#ffb400', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }
    })
    map.addLayer({
      id: POINT_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'Point'], ['!', ['==', ['get', 'drawMode'], 'symbol']]],
      paint: { 'circle-radius': 5, 'circle-color': '#1a73e8', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }
    })

    const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
    map.addSource(DRAFT_SOURCE_ID, { type: 'geojson', data: emptyFC })
    map.addLayer({
      id: DRAFT_POLYGON_LAYER_ID,
      type: 'fill',
      source: DRAFT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'fill-color': '#e86a4a', 'fill-opacity': 0.1 }
    })
    map.addLayer({
      id: DRAFT_LINE_LAYER_ID,
      type: 'line',
      source: DRAFT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: { 'line-color': '#e86a4a', 'line-width': 2, 'line-dasharray': [4, 4] }
    })
    map.addLayer({
      id: DRAFT_POINT_LAYER_ID,
      type: 'circle',
      source: DRAFT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: { 'circle-radius': 4, 'circle-color': '#e86a4a', 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5 }
    })

    map.addSource(HIGHLIGHT_SOURCE_ID, { type: 'geojson', data: emptyFC })
    map.addLayer({
      id: HIGHLIGHT_POLYGON_LAYER_ID,
      type: 'line',
      source: HIGHLIGHT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'line-color': '#ff0000', 'line-width': 3, 'line-dasharray': [3, 2] }
    })
    map.addLayer({
      id: HIGHLIGHT_LINE_LAYER_ID,
      type: 'line',
      source: HIGHLIGHT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: { 'line-color': '#ff0000', 'line-width': 5 }
    })
    map.addLayer({
      id: HIGHLIGHT_POINT_LAYER_ID,
      type: 'circle',
      source: HIGHLIGHT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: { 'circle-radius': 10, 'circle-color': 'rgba(255, 0, 0, 0.3)', 'circle-stroke-color': '#ff0000', 'circle-stroke-width': 2 }
    })

    return () => {
      ;[HIGHLIGHT_POINT_LAYER_ID, HIGHLIGHT_LINE_LAYER_ID, HIGHLIGHT_POLYGON_LAYER_ID,
        DRAFT_POINT_LAYER_ID, DRAFT_LINE_LAYER_ID, DRAFT_POLYGON_LAYER_ID,
        SYMBOL_LAYER_ID, POINT_LAYER_ID, LINE_LAYER_ID, POLYGON_LAYER_ID].forEach((layerId) => {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
      })
      for (const srcId of [HIGHLIGHT_SOURCE_ID, DRAFT_SOURCE_ID, SOURCE_ID]) {
        if (map.getSource(srcId)) map.removeSource(srcId)
      }
    }
  }, [map])

  // クリック・コンテキストメニュー
  useEffect(() => {
    if (!map) return

    const handleClick = (event: maplibregl.MapMouseEvent) => {
      // ラバーバンド直後またはドラッグ直後はクリックを無視
      if (wasRubberBandingRef.current) return
      if (justDraggedRef.current) return

      setContextMenu(null)

      // 頂点ハンドルをクリックした場合は選択変更しない
      if (map.getLayer(VERTEX_LAYER_ID)) {
        const vertexHit = map.queryRenderedFeatures(event.point, { layers: [VERTEX_LAYER_ID] })
        if (vertexHit.length > 0) return
      }

      // 既存地物をクリックしたか判定
      const hit = map.queryRenderedFeatures(event.point, { layers: CLICKABLE_LAYERS })
      if (hit.length > 0) {
        const clickedId = hit[0].properties?._id as string | undefined
        if (clickedId) {
          const isShift = event.originalEvent.shiftKey
          setSelectedFeatureIds((prev) => {
            if (isShift) {
              const next = new Set(prev)
              if (next.has(clickedId)) next.delete(clickedId)
              else next.add(clickedId)
              return next
            }
            // 単一選択：同じフィーチャなら解除
            if (prev.size === 1 && prev.has(clickedId)) return new Set()
            return new Set([clickedId])
          })
          flashHighlight(clickedId, setHighlightedPanelFeatureId)
          return
        }
      }

      // 地物未クリック → Shift なしなら選択解除
      if (!event.originalEvent.shiftKey) {
        setSelectedFeatureIds(new Set())
      }

      if (!drawMode) return
      const coordinate: [number, number] = [event.lngLat.lng, event.lngLat.lat]
      if (drawMode === 'point' || drawMode === 'symbol') {
        setFeatures((prev) => ({
          ...prev,
          features: [...prev.features, createPointFeature(coordinate, drawMode)]
        }))
        return
      }
      setDraftCoords((prev) => [...prev, coordinate])
    }

    const handleContextMenu = (event: maplibregl.MapMouseEvent) => {
      const hit = map.queryRenderedFeatures(event.point, { layers: CLICKABLE_LAYERS })
      if (hit.length > 0) {
        const clickedId = hit[0].properties?._id as string | undefined
        if (clickedId) {
          const found = featuresRef.current.features.find((f) => f.properties?._id === clickedId)
          if (found) {
            event.preventDefault()
            setContextMenu({ feature: found, x: event.originalEvent.clientX, y: event.originalEvent.clientY })
            return
          }
        }
      }
      setContextMenu(null)
    }

    map.on('click', handleClick)
    map.on('contextmenu', handleContextMenu)
    return () => {
      map.off('click', handleClick)
      map.off('contextmenu', handleContextMenu)
    }
  }, [map, drawMode, flashHighlight, justDraggedRef])

  // ラバーバンド選択（描画モードなしの時のみ有効）
  useEffect(() => {
    if (!map) return

    const onMouseDown = (e: maplibregl.MapMouseEvent) => {
      if (drawModeRef.current) return // 描画モード中は無効
      const hit = map.queryRenderedFeatures(e.point, { layers: CLICKABLE_LAYERS })
      if (hit.length > 0) return // フィーチャクリック時は無効
      rbDragRef.current = { startPoint: { x: e.point.x, y: e.point.y }, isActive: false }
      map.dragPan.disable()
    }

    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (!rbDragRef.current) return
      const { startPoint } = rbDragRef.current
      const dx = e.point.x - startPoint.x
      const dy = e.point.y - startPoint.y
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
      rbDragRef.current.isActive = true
      setRubberBand({
        x: Math.min(startPoint.x, e.point.x),
        y: Math.min(startPoint.y, e.point.y),
        width: Math.abs(dx),
        height: Math.abs(dy),
      })
    }

    const onMouseUp = (e: maplibregl.MapMouseEvent) => {
      if (!rbDragRef.current) return
      const { startPoint, isActive } = rbDragRef.current
      rbDragRef.current = null
      map.dragPan.enable()
      setRubberBand(null)
      if (!isActive) return

      wasRubberBandingRef.current = true
      setTimeout(() => { wasRubberBandingRef.current = false }, 50)

      const topLeft: [number, number] = [Math.min(startPoint.x, e.point.x), Math.min(startPoint.y, e.point.y)]
      const bottomRight: [number, number] = [Math.max(startPoint.x, e.point.x), Math.max(startPoint.y, e.point.y)]
      const hits = map.queryRenderedFeatures([topLeft, bottomRight], { layers: CLICKABLE_LAYERS })
      const ids = new Set(hits.map((f) => f.properties?._id as string).filter(Boolean))
      setSelectedFeatureIds((prev) => {
        if (e.originalEvent.shiftKey) {
          const next = new Set(prev)
          ids.forEach((id) => next.add(id))
          return next
        }
        return ids
      })
    }

    map.on('mousedown', onMouseDown)
    map.on('mousemove', onMouseMove)
    map.on('mouseup', onMouseUp)
    return () => {
      map.off('mousedown', onMouseDown)
      map.off('mousemove', onMouseMove)
      map.off('mouseup', onMouseUp)
    }
  }, [map])

  useEffect(() => {
    if (!map) return
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source || typeof source.setData !== 'function') return
    source.setData(features)
  }, [map, features])

  useEffect(() => {
    if (!map) return
    const source = map.getSource(DRAFT_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source || typeof source.setData !== 'function') return
    const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
    if (isDrawingPath && draftCoords.length >= 1) {
      source.setData(createDraftFeatureCollection(draftCoords, drawMode as PathMode))
    } else {
      source.setData(emptyFC)
    }
  }, [map, draftCoords, drawMode, isDrawingPath])

  // ハイライト表示更新（全選択フィーチャを表示）
  useEffect(() => {
    if (!map) return
    const source = map.getSource(HIGHLIGHT_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source || typeof source.setData !== 'function') return
    const selected = features.features.filter((f) => selectedFeatureIds.has(f.properties?._id as string))
    source.setData({ type: 'FeatureCollection', features: selected })
  }, [map, selectedFeatureIds, features])

  const finalizeDraft = () => {
    if (!isDrawingPath || !canFinalizeDraft) return
    const newFeature = createPathFeature(draftCoords, drawMode as PathMode)
    setFeatures((prev) => ({ ...prev, features: [...prev.features, newFeature] }))
    setDraftCoords([])
  }

  const deleteSelectedFeature = useCallback(() => {
    if (selectedFeatureIds.size === 0) return
    setFeatures((prev) => ({
      ...prev,
      features: prev.features.filter((f) => !selectedFeatureIds.has(f.properties?._id as string)),
    }))
    setSelectedFeatureIds(new Set())
  }, [selectedFeatureIds])

  const updateFeatureProperties = useCallback((featureId: string, userProperties: Record<string, string>) => {
    setFeatures((prev) => ({
      ...prev,
      features: prev.features.map((f) => {
        if (f.properties?._id !== featureId) return f
        return { ...f, properties: mergeUserProperties(f.properties, userProperties) }
      }),
    }))
  }, [])

  const resetGeoJSON = useCallback(() => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = null
    }
    setFeatures({ type: 'FeatureCollection', features: [] })
    setDraftCoords([])
    setSelectedFeatureIds(new Set())
    setHighlightedPanelFeatureId(null)
  }, [])

  const handlePanelFeatureClick = useCallback((featureId: string) => {
    const feature = features.features.find((f) => f.properties?._id === featureId)
    if (!feature || !map) return
    const center = getFeatureCenter(feature)
    if (center) map.flyTo({ center, duration: 300 })
    setSelectedFeatureIds(new Set([featureId]))
    flashHighlight(featureId, (id) => {
      if (!id) setSelectedFeatureIds(new Set())
    })
  }, [features, map, flashHighlight])

  const handleImportCSV = useCallback((text: string) => {
    const rows = parseCSV(text)
    const newFeatures: GeoJSON.Feature[] = rows.map((row) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [row.lng, row.lat] },
      properties: { _id: nextFeatureId(), drawMode: 'point', ...row.properties },
    }))
    setFeatures((prev) => ({ ...prev, features: [...prev.features, ...newFeatures] }))
  }, [])

  const handleAddressSearch = useCallback((lat: number, lng: number) => {
    if (!map) return
    map.flyTo({ center: [lng, lat], zoom: 16 })
  }, [map])

  // Undo/Redo キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) return
      const isMac = /mac/i.test(navigator.userAgent)
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey
      if (!ctrlOrCmd) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoFeatures()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        redoFeatures()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undoFeatures, redoFeatures])

  const handleCopy = useCallback((result: { message: string; type: 'success' | 'error' }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(result)
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 1500)
  }, [])

  // URL パラメータからフィーチャを初期ロード（マウント時のみ）
  useEffect(() => {
    const imported = decodeURLToFeatures()
    if (imported && imported.features.length > 0) {
      setFeatures(imported)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleImportGeoJSON = useCallback((importedFeatures: GeoJSON.Feature[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
        highlightTimerRef.current = null
      }
      setFeatures({ type: 'FeatureCollection', features: importedFeatures })
      setDraftCoords([])
      setSelectedFeatureIds(new Set())
      setHighlightedPanelFeatureId(null)
    } else {
      setFeatures((prev) => ({ ...prev, features: [...prev.features, ...importedFeatures] }))
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        className='map'
        ref={containerRef}
        data-lang='ja'
        data-gesture-handling='off'
        data-navigation-control='off'
        data-scale-control='on'
        style={{ width: '100%', height: '100%' }}
      />

      {/* ラバーバンド選択の視覚表示 */}
      {rubberBand && (
        <div
          style={{
            position: 'absolute',
            left: rubberBand.x,
            top: rubberBand.y,
            width: rubberBand.width,
            height: rubberBand.height,
            border: '2px dashed #1a73e8',
            background: 'rgba(26, 115, 232, 0.08)',
            pointerEvents: 'none',
          }}
        />
      )}

      <AppLogo />

      <AddressSearchBar onSearch={handleAddressSearch} />

      <DrawControlPanel
        drawMode={drawMode}
        isDrawingPath={isDrawingPath}
        canFinalizeDraft={canFinalizeDraft}
        hasSelectedFeature={selectedFeatureIds.size > 0}
        selectedCount={selectedFeatureIds.size}
        canUndo={canUndo}
        canRedo={canRedo}
        onChangeMode={setDrawMode}
        onFinalize={finalizeDraft}
        onDeleteFeature={deleteSelectedFeature}
        onResetGeoJSON={resetGeoJSON}
        onShareURL={copyShareURL}
        onUndo={undoFeatures}
        onRedo={redoFeatures}
        onImportCSV={handleImportCSV}
        onImportGeoJSON={handleImportGeoJSON}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <GeoJSONPanel
        featureCollection={features}
        highlightedFeatureId={highlightedPanelFeatureId}
        onFeatureClick={handlePanelFeatureClick}
        onUpdateFeatureProperties={updateFeatureProperties}
      />

      {contextMenu && (
        <FeatureContextMenu
          feature={contextMenu.feature}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onCopy={handleCopy}
        />
      )}

      {toast && (
        <div className={`map-toast map-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
