import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { DRAW_CONTROL_PANEL, DRAW_CONTROL_GRIP } from '../support/helpers/selectors.js'

Given('パネルの初期位置を記録する', async function (this: CustomWorld) {
  const panel = this.page.locator(DRAW_CONTROL_PANEL)
  const box = await panel.boundingBox()
  if (!box) throw new Error('パネルが見つかりません')
  this.panelInitialX = box.x
  this.panelInitialY = box.y
})

When('グリップを右に {int}px 下に {int}px ドラッグする', async function (
  this: CustomWorld,
  dx: number,
  dy: number,
) {
  const grip = this.page.locator(DRAW_CONTROL_GRIP)
  const box = await grip.boundingBox()
  if (!box) throw new Error('グリップが見つかりません')

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await this.page.mouse.move(startX, startY)
  await this.page.waitForTimeout(100)
  await this.page.mouse.down()
  await this.page.waitForTimeout(100)

  // 複数ステップで移動（ドラッグの安定性向上）
  const steps = 5
  for (let i = 1; i <= steps; i++) {
    await this.page.mouse.move(
      startX + (dx * i) / steps,
      startY + (dy * i) / steps,
    )
    await this.page.waitForTimeout(50)
  }

  await this.page.mouse.up()
  await this.page.waitForTimeout(200)
})

Then('パネルが右に約 {int}px 下に約 {int}px 移動している', async function (
  this: CustomWorld,
  expectedDx: number,
  expectedDy: number,
) {
  const panel = this.page.locator(DRAW_CONTROL_PANEL)
  const box = await panel.boundingBox()
  if (!box) throw new Error('パネルが見つかりません')

  const actualDx = box.x - this.panelInitialX
  const actualDy = box.y - this.panelInitialY

  // 数ピクセルの誤差を許容
  const tolerance = 10
  expect(Math.abs(actualDx - expectedDx)).toBeLessThanOrEqual(tolerance)
  expect(Math.abs(actualDy - expectedDy)).toBeLessThanOrEqual(tolerance)
})

Then('ドラッググリップが表示されている', async function (this: CustomWorld) {
  await expect(this.page.locator(DRAW_CONTROL_GRIP)).toBeVisible()
})
