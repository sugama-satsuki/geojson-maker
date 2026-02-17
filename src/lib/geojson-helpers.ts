import { DrawMode } from '../components/DrawModeSelector'

type PathMode = Extract<DrawMode, 'line' | 'polygon'>

let featureIdCounter = 0
export function nextFeatureId(): string {
  return `geolonia-${++featureIdCounter}`
}

export function closePolygonRing(vertices: [number, number][]): [number, number][] {
  if (vertices.length === 0) return []
  const first = vertices[0]
  const last = vertices[vertices.length - 1]
  const shouldClose = first[0] !== last[0] || first[1] !== last[1]
  return shouldClose ? [...vertices, first] : vertices
}

export function createPointFeature(coordinate: [number, number], mode: DrawMode): GeoJSON.Feature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinate
    },
    properties: {
      _id: nextFeatureId(),
      drawMode: mode
    }
  }
}

export function createDraftFeatureCollection(
  coords: [number, number][],
  mode: PathMode
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []

  if (coords.length === 0) {
    return { type: 'FeatureCollection', features }
  }

  // 頂点を Point として追加
  for (const coord of coords) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coord },
      properties: {}
    })
  }

  if (coords.length >= 2) {
    // ポリゴンモードで3点以上なら Polygon + 外周 LineString
    if (mode === 'polygon' && coords.length >= 3) {
      const closed = closePolygonRing(coords)
      features.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [closed] },
        properties: {}
      })
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: closed },
        properties: {}
      })
    } else {
      // ライン、またはポリゴンで3点未満
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {}
      })
    }
  }

  return { type: 'FeatureCollection', features }
}

export function createPathFeature(vertices: [number, number][], mode: PathMode): GeoJSON.Feature {
  const geometry: GeoJSON.LineString | GeoJSON.Polygon =
    mode === 'line'
      ? {
        type: 'LineString',
        coordinates: vertices
      }
      : {
        type: 'Polygon',
        coordinates: [closePolygonRing(vertices)]
      }

  return {
    type: 'Feature',
    geometry,
    properties: {
      _id: nextFeatureId(),
      drawMode: mode
    }
  }
}

