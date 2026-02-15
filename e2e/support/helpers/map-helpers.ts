import { Page } from '@playwright/test'
import { MAP_CANVAS, GEOJSON_TEXTAREA } from './selectors.js'

/**
 * 地図の描画完了を待機する（window.__mapReady フラグをポーリング）
 */
export async function waitForMapReady(page: Page): Promise<void> {
  await page.waitForSelector(MAP_CANVAS, { state: 'visible', timeout: 30000 })
  await page.waitForFunction('window.__mapReady === true', { timeout: 30000 })
}

/**
 * Canvas の中央からの相対座標でクリックする
 * Viewport 1280x720 固定で、左パネル(280px) と右パネル(360px) を避けた安全領域を使用
 *
 * SwiftShader 環境でのクリック検出を安定させるため、
 * マウスを事前に移動させてから mousedown/mouseup を個別に実行する。
 */
export async function clickMapAtOffset(
  page: Page,
  offsetX: number = 0,
  offsetY: number = 0,
): Promise<void> {
  const canvas = page.locator(MAP_CANVAS)
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Canvas が見つかりません')

  // パネルを避けた安全領域の中央: 左 280px + 右 360px を除いた中央
  const safeAreaCenterX = 280 + (box.width - 280 - 360) / 2
  const safeAreaCenterY = box.height / 2

  const x = box.x + safeAreaCenterX + offsetX
  const y = box.y + safeAreaCenterY + offsetY

  // マウスを一旦離してからターゲットへ移動し、安定した click イベントを発行
  await page.mouse.move(0, 0)
  await page.waitForTimeout(50)
  await page.mouse.move(x, y)
  await page.waitForTimeout(100)
  await page.mouse.down()
  await page.waitForTimeout(50)
  await page.mouse.up()

  // クリック後の state 更新を待つ
  await page.waitForTimeout(300)
}

/**
 * GeoJSON パネルのテキストエリアから FeatureCollection をパースして返す
 */
export async function getGeoJSONFromPanel(page: Page): Promise<GeoJSON.FeatureCollection> {
  const value = await page.locator(GEOJSON_TEXTAREA).inputValue()
  return JSON.parse(value) as GeoJSON.FeatureCollection
}
