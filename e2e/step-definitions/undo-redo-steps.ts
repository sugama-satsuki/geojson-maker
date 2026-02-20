import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'

const UNDO_BUTTON_TITLE = '[title="元に戻す (Ctrl+Z)"]'
const REDO_BUTTON_TITLE = '[title="やり直す (Ctrl+Shift+Z)"]'

When('Undo ボタンをクリックする', { timeout: 15000 }, async function (this: CustomWorld) {
  await this.page.locator(UNDO_BUTTON_TITLE).click()
  await this.page.waitForTimeout(300)
})

When('Redo ボタンをクリックする', { timeout: 15000 }, async function (this: CustomWorld) {
  await this.page.locator(REDO_BUTTON_TITLE).click()
  await this.page.waitForTimeout(300)
})

Then('Undo ボタンが無効である', async function (this: CustomWorld) {
  await expect(this.page.locator(UNDO_BUTTON_TITLE)).toBeDisabled()
})

Then('Redo ボタンが無効である', async function (this: CustomWorld) {
  await expect(this.page.locator(REDO_BUTTON_TITLE)).toBeDisabled()
})
