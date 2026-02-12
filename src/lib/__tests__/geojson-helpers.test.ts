import { describe, it, expect } from 'vitest'
import { closePolygonRing, createPointFeature, createPathFeature } from '../geojson-helpers'

describe('closePolygonRing', () => {
  it('空配列を渡すと空配列を返す', () => {
    expect(closePolygonRing([])).toEqual([])
  })

  it('1点のみの場合、first と last が同一なのでそのまま返す', () => {
    const vertices: [number, number][] = [[139.0, 35.0]]
    const result = closePolygonRing(vertices)
    expect(result).toEqual([[139.0, 35.0]])
    expect(result).toBe(vertices)
  })

  it('閉じていないリングの場合、最初の点を末尾に追加する', () => {
    const vertices: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
    ]
    expect(closePolygonRing(vertices)).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ])
  })

  it('既に閉じているリングはそのまま返す', () => {
    const vertices: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ]
    const result = closePolygonRing(vertices)
    expect(result).toEqual(vertices)
    expect(result).toBe(vertices) // 同一参照
  })
})

describe('createPointFeature', () => {
  it('mode="point" で正しい Feature 構造を返す', () => {
    const result = createPointFeature([139.767, 35.681], 'point')
    expect(result).toEqual({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.767, 35.681],
      },
      properties: {
        drawMode: 'point',
      },
    })
  })

  it('mode="symbol" で drawMode プロパティが symbol になる', () => {
    const result = createPointFeature([0, 0], 'symbol')
    expect(result.properties).toEqual({ drawMode: 'symbol' })
  })
})

describe('createPathFeature', () => {
  it('mode="line" で LineString ジオメトリを返す', () => {
    const vertices: [number, number][] = [
      [0, 0],
      [1, 1],
    ]
    const result = createPathFeature(vertices, 'line')
    expect(result).toEqual({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      properties: {
        drawMode: 'line',
      },
    })
  })

  it('mode="polygon" で Polygon ジオメトリを返し、リングが閉じている', () => {
    const vertices: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
    ]
    const result = createPathFeature(vertices, 'polygon')
    expect(result).toEqual({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
      properties: {
        drawMode: 'polygon',
      },
    })
  })
})
