import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { DRAFT_TEXT, DRAFT_BUTTON, CLEAR_BUTTON } from '../support/helpers/selectors.js'

When('確定ボタンをクリックする', { timeout: 15000 }, async function (this: CustomWorld) {
  await this.page.waitForSelector(DRAFT_BUTTON, { state: 'visible', timeout: 10000 })
  await this.page.locator(DRAFT_BUTTON).click()
  await this.page.waitForTimeout(800)
})

When('クリアボタンをクリックする', { timeout: 15000 }, async function (this: CustomWorld) {
  await this.page.waitForSelector(CLEAR_BUTTON, { state: 'visible', timeout: 10000 })
  await this.page.locator(CLEAR_BUTTON).click()
  await this.page.waitForTimeout(800)
})

Then('ドラフトテキストが {string} と表示される', async function (this: CustomWorld, expectedText: string) {
  await expect(this.page.locator(DRAFT_TEXT)).toHaveText(expectedText)
})

Then('確定ボタンが無効である', async function (this: CustomWorld) {
  await expect(this.page.locator(DRAFT_BUTTON)).toBeDisabled()
})

Then('確定ボタンが有効である', async function (this: CustomWorld) {
  await expect(this.page.locator(DRAFT_BUTTON)).toBeEnabled()
})
