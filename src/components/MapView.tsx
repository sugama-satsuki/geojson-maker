import { useEffect, useRef, useState, useCallback } from 'react'
import type maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import { useGeoloniaMap } from '../hooks/useGeoloniaMap'
import { DrawMode } from './DrawModeSelector'
import { DrawControlPanel } from './DrawControlPanel'
import { GeoJSONPanel } from './GeoJSONPanel'
import { createPointFeature, createPathFeature, createDraftFeatureCollection } from '../lib/geojson-helpers'
import { getFeatureCenter } from '../lib/feature-center'

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

  const [drawMode, setDrawMode] = useState<DrawMode>('point')
  const [features, setFeatures] = useState<FeatureCollection>({ type: 'FeatureCollection', features: [] })
  const [draftCoords, setDraftCoords] = useState<[number, number][]>([])
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [highlightedPanelFeatureId, setHighlightedPanelFeatureId] = useState<string | null>(null)
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    setDraftCoords([])
    setSelectedFeatureId(null)
  }, [drawMode])

  useEffect(() => {
    if (!map) return
    if (map.getSource(SOURCE_ID)) return

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: features
    })

    map.addLayer({
      id: POLYGON_LAYER_ID,
      type: 'fill',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'Polygon']],
      paint: {
        'fill-color': '#e86a4a',
        'fill-opacity': 0.2
      }
    })

    map.addLayer({
      id: LINE_LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'LineString']],
      paint: {
        'line-color': '#e86a4a',
        'line-width': 3
      }
    })

    map.addLayer({
      id: SYMBOL_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'drawMode'], 'symbol']],
      paint: {
        'circle-radius': 7,
        'circle-color': '#ffb400',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
      }
    })

    map.addLayer({
      id: POINT_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'drawMode'], 'point']],
      paint: {
        'circle-radius': 5,
        'circle-color': '#1a73e8',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
      }
    })

    // ドラフトプレビュー用ソース＆レイヤー
    const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
    map.addSource(DRAFT_SOURCE_ID, { type: 'geojson', data: emptyFC })

    map.addLayer({
      id: DRAFT_POLYGON_LAYER_ID,
      type: 'fill',
      source: DRAFT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'fill-color': '#e86a4a',
        'fill-opacity': 0.1
      }
    })

    map.addLayer({
      id: DRAFT_LINE_LAYER_ID,
      type: 'line',
      source: DRAFT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': '#e86a4a',
        'line-width': 2,
        'line-dasharray': [4, 4]
      }
    })

    map.addLayer({
      id: DRAFT_POINT_LAYER_ID,
      type: 'circle',
      source: DRAFT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 4,
        'circle-color': '#e86a4a',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1.5
      }
    })

    // ハイライト用ソース＆レイヤー
    map.addSource(HIGHLIGHT_SOURCE_ID, { type: 'geojson', data: emptyFC })

    map.addLayer({
      id: HIGHLIGHT_POLYGON_LAYER_ID,
      type: 'line',
      source: HIGHLIGHT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: {
        'line-color': '#ff0000',
        'line-width': 3,
        'line-dasharray': [3, 2]
      }
    })

    map.addLayer({
      id: HIGHLIGHT_LINE_LAYER_ID,
      type: 'line',
      source: HIGHLIGHT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: {
        'line-color': '#ff0000',
        'line-width': 5
      }
    })

    map.addLayer({
      id: HIGHLIGHT_POINT_LAYER_ID,
      type: 'circle',
      source: HIGHLIGHT_SOURCE_ID,
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 10,
        'circle-color': 'rgba(255, 0, 0, 0.3)',
        'circle-stroke-color': '#ff0000',
        'circle-stroke-width': 2
      }
    })

    return () => {
      ;[HIGHLIGHT_POINT_LAYER_ID, HIGHLIGHT_LINE_LAYER_ID, HIGHLIGHT_POLYGON_LAYER_ID,
        DRAFT_POINT_LAYER_ID, DRAFT_LINE_LAYER_ID, DRAFT_POLYGON_LAYER_ID,
        SYMBOL_LAYER_ID, POINT_LAYER_ID, LINE_LAYER_ID, POLYGON_LAYER_ID].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId)
        }
      })
      for (const srcId of [HIGHLIGHT_SOURCE_ID, DRAFT_SOURCE_ID, SOURCE_ID]) {
        if (map.getSource(srcId)) map.removeSource(srcId)
      }
    }
  }, [map])

  useEffect(() => {
    if (!map) return

    const handleClick = (event: maplibregl.MapMouseEvent) => {
      // 既存地物をクリックしたか判定
      const hit = map.queryRenderedFeatures(event.point, { layers: CLICKABLE_LAYERS })
      if (hit.length > 0) {
        const clickedId = hit[0].properties?._id as string | undefined
        if (clickedId) {
          setSelectedFeatureId((prev) => prev === clickedId ? null : clickedId)
          // 地図クリック → パネル側ハイライト
          flashHighlight(clickedId, setHighlightedPanelFeatureId)
          return
        }
      }

      // 地物未クリック → 選択解除して通常の描画処理
      setSelectedFeatureId(null)
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

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, drawMode, flashHighlight])

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

  // ハイライト表示更新
  useEffect(() => {
    if (!map) return
    const source = map.getSource(HIGHLIGHT_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source || typeof source.setData !== 'function') return
    const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
    if (selectedFeatureId) {
      const selected = features.features.find((f) => f.properties?._id === selectedFeatureId)
      if (selected) {
        source.setData({ type: 'FeatureCollection', features: [selected] })
        return
      }
    }
    source.setData(emptyFC)
  }, [map, selectedFeatureId, features])

  const finalizeDraft = () => {
    if (!isDrawingPath || !canFinalizeDraft) return
    const pathMode = drawMode as PathMode
    const newFeature = createPathFeature(draftCoords, pathMode)
    setFeatures((prev) => ({
      ...prev,
      features: [...prev.features, newFeature]
    }))
    setDraftCoords([])
  }

  const deleteSelectedFeature = useCallback(() => {
    if (!selectedFeatureId) return
    setFeatures((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.properties?._id !== selectedFeatureId)
    }))
    setSelectedFeatureId(null)
  }, [selectedFeatureId])

  const resetGeoJSON = useCallback(() => {
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
      highlightTimerRef.current = null
    }
    setFeatures({ type: 'FeatureCollection', features: [] })
    setDraftCoords([])
    setSelectedFeatureId(null)
    setHighlightedPanelFeatureId(null)
  }, [])

  // パネルからフィーチャクリック → 地図中心移動 + ハイライト
  const handlePanelFeatureClick = useCallback((featureId: string) => {
    const feature = features.features.find((f) => f.properties?._id === featureId)
    if (!feature || !map) return

    const center = getFeatureCenter(feature)
    if (center) {
      map.flyTo({ center, duration: 300 })
    }

    // 地図側ハイライト（選択状態 + 0.5秒後に解除）
    setSelectedFeatureId(featureId)
    flashHighlight(featureId, (id) => {
      if (!id) setSelectedFeatureId(null)
    })
  }, [features, map, flashHighlight])

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

      <DrawControlPanel
        drawMode={drawMode}
        isDrawingPath={isDrawingPath}
        canFinalizeDraft={canFinalizeDraft}
        hasSelectedFeature={selectedFeatureId !== null}
        onChangeMode={setDrawMode}
        onFinalize={finalizeDraft}
        onDeleteFeature={deleteSelectedFeature}
        onResetGeoJSON={resetGeoJSON}
      />

      <GeoJSONPanel
        featureCollection={features}
        highlightedFeatureId={highlightedPanelFeatureId}
        onFeatureClick={handlePanelFeatureClick}
      />
    </div>
  )
}
