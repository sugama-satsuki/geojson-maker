import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { MAP_TOAST } from '../support/helpers/selectors.js'

const SHARE_BUTTON = '[aria-label="URLをコピー"]'

When('URLコピーボタンをクリックする', { timeout: 10000 }, async function (this: CustomWorld) {
  await this.page.locator(SHARE_BUTTON).click()
  await this.page.waitForTimeout(500)
})

Then('エラートーストが表示される', async function (this: CustomWorld) {
  const toast = this.page.locator(MAP_TOAST)
  await expect(toast).toBeVisible()
  await expect(toast).toHaveClass(/map-toast--error/)
})

Then('成功トーストが表示される', async function (this: CustomWorld) {
  const toast = this.page.locator(MAP_TOAST)
  await expect(toast).toBeVisible()
  await expect(toast).toHaveClass(/map-toast--success/)
})
