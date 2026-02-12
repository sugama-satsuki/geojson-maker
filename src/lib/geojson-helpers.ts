import { DrawMode } from '../components/DrawModeSelector'

type PathMode = Extract<DrawMode, 'line' | 'polygon'>

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
      drawMode: mode
    }
  }
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
      drawMode: mode
    }
  }
}
