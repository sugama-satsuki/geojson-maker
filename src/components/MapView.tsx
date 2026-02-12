import { useEffect, useRef, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import { useGeoloniaMap } from '../hooks/useGeoloniaMap'
import { DrawMode } from './DrawModeSelector'
import { DrawControlPanel } from './DrawControlPanel'
import { GeoJSONPanel } from './GeoJSONPanel'
import { createPointFeature, createPathFeature } from '../lib/geojson-helpers'

export type FeatureCollection = GeoJSON.FeatureCollection

const MAP_STYLE = 'https://smartmap.styles.geoloniamaps.com/style.json'
const SOURCE_ID = 'geojson-maker-generated-features'
const POINT_LAYER_ID = 'geojson-maker-point-layer'
const SYMBOL_LAYER_ID = 'geojson-maker-symbol-layer'
const LINE_LAYER_ID = 'geojson-maker-line-layer'
const POLYGON_LAYER_ID = 'geojson-maker-polygon-layer'

const MODE_HELPERS: Record<DrawMode, string> = {
  point: 'クリックした地点をポイントとして GeoJSON に追加します。',
  line: 'クリックした地点を順に線として登録し、「完了」で確定します。',
  polygon: 'クリックした地点をポリゴンとして登録し、「完了」で閉じます。',
  symbol: 'クリックした地点にシンボル（強調表示されたポイント）を置きます。'
}

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

  const isDrawingPath = drawMode === 'line' || drawMode === 'polygon'
  const requiredVertices = drawMode === 'polygon' ? 3 : 2
  const canFinalizeDraft = isDrawingPath && draftCoords.length >= requiredVertices

  useEffect(() => {
    setDraftCoords([])
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

    return () => {
      ;[SYMBOL_LAYER_ID, POINT_LAYER_ID, LINE_LAYER_ID, POLYGON_LAYER_ID].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId)
        }
      })
      const source = map.getSource(SOURCE_ID)
      if (source) {
        map.removeSource(SOURCE_ID)
      }
    }
  }, [map])

  useEffect(() => {
    if (!map) return

    const handleClick = (event: maplibregl.MapMouseEvent) => {
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
  }, [map, drawMode])

  useEffect(() => {
    if (!map) return
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source || typeof source.setData !== 'function') return
    source.setData(features)
  }, [map, features])

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

  const clearDraft = () => setDraftCoords([])

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
        helperText={MODE_HELPERS[drawMode]}
        isDrawingPath={isDrawingPath}
        draftCount={draftCoords.length}
        canFinalizeDraft={canFinalizeDraft}
        onChangeMode={setDrawMode}
        onFinalize={finalizeDraft}
        onClearDraft={clearDraft}
        featuresCount={features.features.length}
      />

      <GeoJSONPanel featureCollection={features} />
    </div>
  )
}
