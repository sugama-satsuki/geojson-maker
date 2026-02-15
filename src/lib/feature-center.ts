/**
 * GeoJSON Feature の中心座標を算出するユーティリティ
 */

export function getFeatureCenter(feature: GeoJSON.Feature): [number, number] | null {
  const { geometry } = feature
  if (!geometry) return null

  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates as [number, number]

    case 'LineString': {
      const coords = geometry.coordinates
      if (coords.length === 0) return null
      const sumLng = coords.reduce((s, c) => s + c[0], 0)
      const sumLat = coords.reduce((s, c) => s + c[1], 0)
      return [sumLng / coords.length, sumLat / coords.length]
    }

    case 'Polygon': {
      // 外周リング（最後の閉じ点は除外）の重心
      const ring = geometry.coordinates[0]
      if (!ring || ring.length < 2) return null
      const pts = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
        ? ring.slice(0, -1)
        : ring
      const sLng = pts.reduce((s, c) => s + c[0], 0)
      const sLat = pts.reduce((s, c) => s + c[1], 0)
      return [sLng / pts.length, sLat / pts.length]
    }

    default:
      return null
  }
}
