import { useEffect, useRef } from 'react'
import type maplibregl from 'maplibre-gl'
import type { FeatureCollection } from '../components/MapView'

export const VERTEX_SOURCE_ID = 'geojson-maker-vertex'
export const VERTEX_LAYER_ID = 'geojson-maker-vertex-layer'

/** ライン / ポリゴンの頂点ハンドル (Point Feature) を計算する */
function getVertexHandles(feature: GeoJSON.Feature): GeoJSON.FeatureCollection {
  const handles: GeoJSON.Feature[] = []
  const geom = feature.geometry
  const featureId = feature.properties?._id as string

  if (geom.type === 'LineString') {
    geom.coordinates.forEach((coord, i) => {
      handles.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coord },
        properties: { featureId, vertexIndex: i },
      })
    })
  } else if (geom.type === 'Polygon') {
    // 外周リング、閉じる重複点を除く
    geom.coordinates[0].slice(0, -1).forEach((coord, i) => {
      handles.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: coord },
        properties: { featureId, vertexIndex: i },
      })
    })
  }

  return { type: 'FeatureCollection', features: handles }
}

/** 特定の頂点を新しい座標に移動した Feature を返す */
function applyVertexMove(
  feature: GeoJSON.Feature,
  vertexIndex: number,
  newCoord: [number, number]
): GeoJSON.Feature {
  const geom = feature.geometry
  if (geom.type === 'LineString') {
    const coords = geom.coordinates.map((c, i) =>
      i === vertexIndex ? newCoord : c
    ) as [number, number][]
    return { ...feature, geometry: { ...geom, coordinates: coords } }
  }
  if (geom.type === 'Polygon') {
    const ring = geom.coordinates[0].map((c, i) => {
      if (i === vertexIndex) return newCoord
      // 頂点 0 を動かす場合、閉じる点も更新
      if (vertexIndex === 0 && i === geom.coordinates[0].length - 1) return newCoord
      return c
    }) as [number, number][]
    return { ...feature, geometry: { ...geom, coordinates: [ring] } }
  }
  return feature
}

type UseVertexEditingOptions = {
  map: maplibregl.Map | null
  features: FeatureCollection
  selectedFeatureId: string | null
  mainSourceId: string
  onCommit: (updatedFeature: GeoJSON.Feature) => void
}

export function useVertexEditing({
  map,
  features,
  selectedFeatureId,
  mainSourceId,
  onCommit,
}: UseVertexEditingOptions) {
  /** クリックハンドラと共有する「ドラッグ直後フラグ」 */
  const justDraggedRef = useRef(false)

  const dragRef = useRef<{
    featureId: string
    vertexIndex: number
    feature: GeoJSON.Feature
    hasMoved: boolean
  } | null>(null)

  /** effects の依存を増やさずに最新の features を参照するための ref */
  const featuresRef = useRef(features)
  featuresRef.current = features

  // 頂点ハンドル用ソース＆レイヤーのセットアップ
  useEffect(() => {
    if (!map) return
    const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
    map.addSource(VERTEX_SOURCE_ID, { type: 'geojson', data: emptyFC })
    map.addLayer({
      id: VERTEX_LAYER_ID,
      type: 'circle',
      source: VERTEX_SOURCE_ID,
      paint: {
        'circle-radius': 6,
        'circle-color': '#ffffff',
        'circle-stroke-color': '#1a73e8',
        'circle-stroke-width': 2.5,
      },
    })

    return () => {
      if (map.getLayer(VERTEX_LAYER_ID)) map.removeLayer(VERTEX_LAYER_ID)
      if (map.getSource(VERTEX_SOURCE_ID)) map.removeSource(VERTEX_SOURCE_ID)
    }
  }, [map])

  // 選択フィーチャが変わるたびに頂点ハンドルを更新
  useEffect(() => {
    if (!map) return
    const source = map.getSource(VERTEX_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
    if (!source || typeof source.setData !== 'function') return
    const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

    if (!selectedFeatureId) {
      source.setData(emptyFC)
      return
    }
    const selected = features.features.find((f) => f.properties?._id === selectedFeatureId)
    if (!selected || (selected.geometry.type !== 'LineString' && selected.geometry.type !== 'Polygon')) {
      source.setData(emptyFC)
      return
    }
    source.setData(getVertexHandles(selected))
  }, [map, selectedFeatureId, features])

  // マウスドラッグイベントハンドラ
  useEffect(() => {
    if (!map) return
    const canvas = map.getCanvas()

    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (dragRef.current) {
        const { featureId, vertexIndex } = dragRef.current
        const newCoord: [number, number] = [e.lngLat.lng, e.lngLat.lat]
        const updatedFeature = applyVertexMove(dragRef.current.feature, vertexIndex, newCoord)
        dragRef.current.feature = updatedFeature
        dragRef.current.hasMoved = true

        // 頂点ハンドルをリアルタイム更新
        const vertexSrc = map.getSource(VERTEX_SOURCE_ID) as maplibregl.GeoJSONSource | undefined
        if (vertexSrc) vertexSrc.setData(getVertexHandles(updatedFeature))

        // メインソースも即時更新（プレビュー）
        const mainSrc = map.getSource(mainSourceId) as maplibregl.GeoJSONSource | undefined
        if (mainSrc) {
          mainSrc.setData({
            type: 'FeatureCollection',
            features: featuresRef.current.features.map((f) =>
              f.properties?._id === featureId ? updatedFeature : f
            ),
          })
        }
        return
      }

      // カーソル変更（ホバー検出）
      if (!map.getLayer(VERTEX_LAYER_ID)) return
      const hits = map.queryRenderedFeatures(e.point, { layers: [VERTEX_LAYER_ID] })
      canvas.style.cursor = hits.length > 0 ? 'grab' : ''
    }

    const onMouseDown = (e: maplibregl.MapMouseEvent) => {
      if (!map.getLayer(VERTEX_LAYER_ID)) return
      const hits = map.queryRenderedFeatures(e.point, { layers: [VERTEX_LAYER_ID] })
      if (hits.length === 0) return

      const hit = hits[0]
      const featureId = hit.properties?.featureId as string
      const vertexIndex = hit.properties?.vertexIndex as number
      const feature = featuresRef.current.features.find((f) => f.properties?._id === featureId)
      if (!feature) return

      dragRef.current = { featureId, vertexIndex, feature, hasMoved: false }
      canvas.style.cursor = 'grabbing'
      map.dragPan.disable()
    }

    const onMouseUp = () => {
      if (!dragRef.current) return
      const { feature, hasMoved } = dragRef.current
      dragRef.current = null
      map.dragPan.enable()
      canvas.style.cursor = ''

      // クリックによる選択解除を防ぐフラグ
      justDraggedRef.current = true
      setTimeout(() => { justDraggedRef.current = false }, 50)

      if (hasMoved) {
        onCommit(feature)
      }
    }

    map.on('mousemove', onMouseMove)
    map.on('mousedown', onMouseDown)
    map.on('mouseup', onMouseUp)
    return () => {
      map.off('mousemove', onMouseMove)
      map.off('mousedown', onMouseDown)
      map.off('mouseup', onMouseUp)
    }
  }, [map, mainSourceId, onCommit])

  return { justDraggedRef }
}
