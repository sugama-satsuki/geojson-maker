import { describe, it, expect } from 'vitest'
import { featuresToBase64, base64ToFeatures } from '../url-helpers'

const sampleFC: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [139.767, 35.681] },
      properties: { _id: 'test-1', drawMode: 'point', name: 'テスト' },
    },
  ],
}

describe('featuresToBase64 / base64ToFeatures', () => {
  it('FeatureCollection をエンコードして復元できる', () => {
    const encoded = featuresToBase64(sampleFC)
    const decoded = base64ToFeatures(encoded)
    expect(decoded).toEqual(sampleFC)
  })

  it('日本語プロパティ値を含む場合でもラウンドトリップできる', () => {
    const encoded = featuresToBase64(sampleFC)
    const decoded = base64ToFeatures(encoded)
    expect(decoded?.features[0].properties?.name).toBe('テスト')
  })

  it('複数フィーチャのコレクションをラウンドトリップできる', () => {
    const fc: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { _id: 'a' },
        },
        {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
          properties: { _id: 'b' },
        },
      ],
    }
    expect(base64ToFeatures(featuresToBase64(fc))).toEqual(fc)
  })
})

describe('base64ToFeatures エラーケース', () => {
  it('不正な base64 は null を返す', () => {
    expect(base64ToFeatures('!!!invalid!!!')).toBeNull()
  })

  it('FeatureCollection でない JSON は null を返す', () => {
    const invalid = btoa(JSON.stringify({ foo: 'bar' }))
    expect(base64ToFeatures(invalid)).toBeNull()
  })

  it('features が配列でない場合は null を返す', () => {
    const invalid = btoa(JSON.stringify({ type: 'FeatureCollection', features: 'bad' }))
    expect(base64ToFeatures(invalid)).toBeNull()
  })
})
