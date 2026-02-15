import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import {
  GEOJSON_FEATURE_ITEM,
  GEOJSON_FEATURE_ITEM_HIGHLIGHTED,
} from '../support/helpers/selectors.js'

Then('フィーチャリストに {int} 件のアイテムがある', async function (this: CustomWorld, count: number) {
  const items = this.page.locator(GEOJSON_FEATURE_ITEM)
  await expect(items).toHaveCount(count)
})

When('フィーチャリストの {int} 番目をクリックする', async function (this: CustomWorld, index: number) {
  const item = this.page.locator(GEOJSON_FEATURE_ITEM).nth(index - 1)
  await item.click()
  await this.page.waitForTimeout(300)
})

Then('パネルのフィーチャがハイライトされている', async function (this: CustomWorld) {
  const highlighted = this.page.locator(GEOJSON_FEATURE_ITEM_HIGHLIGHTED)
  await expect(highlighted).toHaveCount(1, { timeout: 3000 })
})
