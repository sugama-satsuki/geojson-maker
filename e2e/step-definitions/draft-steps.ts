import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { DELETE_ACTION_BUTTON, CONFIRM_ACTION_BUTTON } from '../support/helpers/selectors.js'

When('確定ボタンをクリックする', { timeout: 30000 }, async function (this: CustomWorld) {
  await this.page.waitForSelector(CONFIRM_ACTION_BUTTON, { state: 'visible', timeout: 20000 })
  await this.page.locator(CONFIRM_ACTION_BUTTON).click()
  await this.page.waitForTimeout(400)
})

When('削除ボタンをクリックする', { timeout: 15000 }, async function (this: CustomWorld) {
  await this.page.waitForSelector(`${DELETE_ACTION_BUTTON}:not([disabled])`, { state: 'visible', timeout: 10000 })
  await this.page.locator(DELETE_ACTION_BUTTON).click()
  await this.page.waitForTimeout(400)
})

Then('確定ボタンが無効である', async function (this: CustomWorld) {
  await expect(this.page.locator(CONFIRM_ACTION_BUTTON)).toBeDisabled()
})

Then('確定ボタンが有効である', async function (this: CustomWorld) {
  await expect(this.page.locator(CONFIRM_ACTION_BUTTON)).toBeEnabled()
})

Then('削除ボタンが無効である', async function (this: CustomWorld) {
  await expect(this.page.locator(DELETE_ACTION_BUTTON)).toBeDisabled()
})

Then('削除ボタンが有効である', async function (this: CustomWorld) {
  await expect(this.page.locator(DELETE_ACTION_BUTTON)).toBeEnabled()
})
