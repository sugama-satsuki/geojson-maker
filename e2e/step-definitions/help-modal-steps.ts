import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { HELP_BUTTON, HELP_MODAL, HELP_MODAL_OVERLAY, HELP_MODAL_CLOSE } from '../support/helpers/selectors.js'

When('ヘルプボタンをクリックする', async function (this: CustomWorld) {
  await this.page.locator(HELP_BUTTON).click()
  await this.page.waitForTimeout(300)
})

Then('使い方モーダルが表示されている', async function (this: CustomWorld) {
  await expect(this.page.locator(HELP_MODAL)).toBeVisible()
})

Then('使い方モーダルが表示されていない', async function (this: CustomWorld) {
  await expect(this.page.locator(HELP_MODAL)).not.toBeVisible()
})

When('閉じるボタンをクリックする', async function (this: CustomWorld) {
  await this.page.locator(HELP_MODAL_CLOSE).click()
  await this.page.waitForTimeout(300)
})

When('オーバーレイをクリックする', async function (this: CustomWorld) {
  // モーダルの外（オーバーレイ）をクリック
  await this.page.locator(HELP_MODAL_OVERLAY).click({ position: { x: 10, y: 10 } })
  await this.page.waitForTimeout(300)
})
