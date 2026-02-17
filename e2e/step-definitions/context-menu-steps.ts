import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { rightClickMapAtOffset } from '../support/helpers/map-helpers.js'
import { FEATURE_CONTEXT_MENU, FEATURE_CONTEXT_MENU_ITEM } from '../support/helpers/selectors.js'

When('地図の中央を右クリックする', async function (this: CustomWorld) {
  await rightClickMapAtOffset(this.page, 0, 0)
})

Then('コンテキストメニューが表示されている', async function (this: CustomWorld) {
  await expect(this.page.locator(FEATURE_CONTEXT_MENU)).toBeVisible()
})

Then('コンテキストメニューが表示されていない', async function (this: CustomWorld) {
  await expect(this.page.locator(FEATURE_CONTEXT_MENU)).not.toBeVisible()
})

Then('コンテキストメニューに {string} が含まれる', async function (this: CustomWorld, text: string) {
  const item = this.page.locator(FEATURE_CONTEXT_MENU_ITEM, { hasText: text })
  await expect(item).toBeVisible()
})

When('コンテキストメニューの {string} をクリックする', async function (this: CustomWorld, text: string) {
  // Clipboard API はセキュアコンテキストでないと使えないため、モックする
  await this.page.evaluate(() => {
    (navigator.clipboard as unknown as { writeText: (t: string) => Promise<void> }).writeText = async () => {}
  })
  const item = this.page.locator(FEATURE_CONTEXT_MENU_ITEM, { hasText: text })
  await item.click()
  await this.page.waitForTimeout(200)
})
