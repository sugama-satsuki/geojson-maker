import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { clickMapAtOffset, rightClickMapAtOffset, getGeoJSONFromPanel } from '../support/helpers/map-helpers.js'
import { VERTEX_CONTEXT_MENU, VERTEX_CONTEXT_MENU_ITEM } from '../support/helpers/selectors.js'

When(
  '地図の中央から右に {int}px 下に {int}px の位置をクリックする',
  async function (this: CustomWorld, px: number, py: number) {
    await clickMapAtOffset(this.page, px, py)
  }
)

When(
  '地図の中央から右に {int}px の位置の頂点を右クリックする',
  { timeout: 15000 },
  async function (this: CustomWorld, offsetX: number) {
    await rightClickMapAtOffset(this.page, offsetX, 0)
  }
)

When(
  '地図の中央の頂点を右クリックする',
  { timeout: 15000 },
  async function (this: CustomWorld) {
    await rightClickMapAtOffset(this.page, 0, 0)
  }
)

When(
  '地図の中央から右に {int}px の位置の頂点をクリック選択する',
  { timeout: 15000 },
  async function (this: CustomWorld, offsetX: number) {
    await clickMapAtOffset(this.page, offsetX, 0)
  }
)

When('「この頂点を削除」をクリックする', { timeout: 15000 }, async function (this: CustomWorld) {
  const item = this.page.locator(VERTEX_CONTEXT_MENU_ITEM, { hasText: 'この頂点を削除' })
  await item.click()
  await this.page.waitForTimeout(400)
})

When('Deleteキーを押す', async function (this: CustomWorld) {
  await this.page.keyboard.press('Delete')
  await this.page.waitForTimeout(400)
})

Then('頂点コンテキストメニューが表示されている', async function (this: CustomWorld) {
  await expect(this.page.locator(VERTEX_CONTEXT_MENU)).toBeVisible()
})

Then('「この頂点を削除」ボタンが無効である', async function (this: CustomWorld) {
  const item = this.page.locator(VERTEX_CONTEXT_MENU_ITEM, { hasText: 'この頂点を削除' })
  await expect(item).toBeDisabled()
})

Then('{int} 番目のフィーチャの座標数が {int} である', async function (
  this: CustomWorld,
  index: number,
  coordCount: number,
) {
  const fc = await getGeoJSONFromPanel(this.page)
  const feature = fc.features[index - 1]
  const geom = feature.geometry
  if (geom.type === 'LineString') {
    expect(geom.coordinates.length).toBe(coordCount)
  } else if (geom.type === 'Polygon') {
    // 閉じ点を除いた実頂点数
    expect(geom.coordinates[0].length - 1).toBe(coordCount)
  } else {
    throw new Error(`Unexpected geometry type: ${geom.type}`)
  }
})

Then('{int} 番目のフィーチャのポリゴン実頂点数が {int} である', async function (
  this: CustomWorld,
  index: number,
  vertexCount: number,
) {
  const fc = await getGeoJSONFromPanel(this.page)
  const geom = fc.features[index - 1].geometry
  expect(geom.type).toBe('Polygon')
  if (geom.type === 'Polygon') {
    // 閉じ点を除いた頂点数
    expect(geom.coordinates[0].length - 1).toBe(vertexCount)
  }
})
