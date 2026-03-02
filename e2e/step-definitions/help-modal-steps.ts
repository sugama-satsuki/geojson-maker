import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { HELP_TAB, HELP_SIDEBAR, HELP_SIDEBAR_CLOSE } from '../support/helpers/selectors.js'

When('ヘルプボタンをクリックする', async function (this: CustomWorld) {
  await this.page.locator(HELP_TAB).click()
  await this.page.waitForTimeout(300)
})

Then('使い方サイドバーが表示されている', async function (this: CustomWorld) {
  await expect(this.page.locator(HELP_SIDEBAR)).toBeVisible()
})

Then('使い方サイドバーが表示されていない', async function (this: CustomWorld) {
  await expect(this.page.locator(HELP_SIDEBAR)).not.toBeVisible()
})

When('閉じるボタンをクリックする', async function (this: CustomWorld) {
  await this.page.locator(HELP_SIDEBAR_CLOSE).click()
  await this.page.waitForTimeout(300)
})

When('Escキーを押す', async function (this: CustomWorld) {
  await this.page.keyboard.press('Escape')
  await this.page.waitForTimeout(300)
})
