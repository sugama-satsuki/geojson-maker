import { describe, it, expect } from 'vitest'
import { getFeatureCenter } from '../feature-center'

describe('getFeatureCenter', () => {
  it('Point の場合、座標そのものを返す', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [139.767, 35.681] },
      properties: {},
    }
    expect(getFeatureCenter(feature)).toEqual([139.767, 35.681])
  })

  it('LineString の場合、全頂点の平均座標を返す', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[0, 0], [2, 0], [2, 2]],
      },
      properties: {},
    }
    const center = getFeatureCenter(feature)!
    expect(center[0]).toBeCloseTo(4 / 3, 5)
    expect(center[1]).toBeCloseTo(2 / 3, 5)
  })

  it('LineString が空座標の場合 null を返す', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [] },
      properties: {},
    }
    expect(getFeatureCenter(feature)).toBeNull()
  })

  it('Polygon の場合、外周リングの重心を返す（閉じ点を除外）', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [3, 0], [3, 3], [0, 0]]],
      },
      properties: {},
    }
    const center = getFeatureCenter(feature)!
    expect(center[0]).toBeCloseTo(2, 5)
    expect(center[1]).toBeCloseTo(1, 5)
  })

  it('Polygon のリングが閉じていない場合もそのまま重心を返す', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [4, 0], [4, 4]]],
      },
      properties: {},
    }
    const center = getFeatureCenter(feature)!
    expect(center[0]).toBeCloseTo(8 / 3, 5)
    expect(center[1]).toBeCloseTo(4 / 3, 5)
  })

  it('Polygon の外周が空の場合 null を返す', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[]] },
      properties: {},
    }
    expect(getFeatureCenter(feature)).toBeNull()
  })

  it('geometry が null の Feature は null を返す', () => {
    const feature = {
      type: 'Feature',
      geometry: null,
      properties: {},
    } as unknown as GeoJSON.Feature
    expect(getFeatureCenter(feature)).toBeNull()
  })

  it('未対応ジオメトリタイプは null を返す', () => {
    const feature: GeoJSON.Feature = {
      type: 'Feature',
      geometry: {
        type: 'MultiPoint',
        coordinates: [[0, 0], [1, 1]],
      },
      properties: {},
    }
    expect(getFeatureCenter(feature)).toBeNull()
  })
})
