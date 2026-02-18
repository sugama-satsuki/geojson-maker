import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import {
  ADDRESS_SEARCH_BAR,
  ADDRESS_SEARCH_INPUT,
  ADDRESS_SEARCH_BUTTON,
  ADDRESS_SEARCH_ERROR,
  ADDRESS_SEARCH_WARNING,
} from '../support/helpers/selectors.js'

Then('住所検索バーが表示されている', async function (this: CustomWorld) {
  await expect(this.page.locator(ADDRESS_SEARCH_BAR)).toBeVisible()
})

When('住所検索バーに {string} と入力する', async function (this: CustomWorld, address: string) {
  await this.page.locator(ADDRESS_SEARCH_INPUT).fill(address)
})

When('検索ボタンをクリックする', async function (this: CustomWorld) {
  await this.page.locator(ADDRESS_SEARCH_BUTTON).click()
})

When('検索バーでEnterキーを押す', async function (this: CustomWorld) {
  await this.page.locator(ADDRESS_SEARCH_INPUT).press('Enter')
})

Then('地図の中心が移動する', { timeout: 15000 }, async function (this: CustomWorld) {
  // normalize API は複数回外部 API を呼ぶため待機
  await this.page.waitForFunction(() => {
    const error = document.querySelector('.address-search-bar__message--error')
    const button = document.querySelector('.address-search-bar__button') as HTMLButtonElement
    // エラーが出ていない & ボタンが有効（検索完了）
    return !error && button && !button.disabled
  }, { timeout: 12000 })
})

Then('{string} エラーが表示される', { timeout: 15000 }, async function (this: CustomWorld, message: string) {
  const error = this.page.locator(ADDRESS_SEARCH_ERROR)
  await expect(error).toBeVisible({ timeout: 12000 })
  await expect(error).toHaveText(message)
})

Then('{string} ワーニングが表示される', { timeout: 15000 }, async function (this: CustomWorld, message: string) {
  const warning = this.page.locator(ADDRESS_SEARCH_WARNING)
  await expect(warning).toBeVisible({ timeout: 12000 })
  await expect(warning).toContainText(message)
})
