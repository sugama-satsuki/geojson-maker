import { When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import {
  GEOJSON_FEATURE_ITEM,
  GEOJSON_TEXTAREA,
  FEATURE_PROPS_EDITOR,
  PROP_KEY_INPUT,
  PROP_VALUE_INPUT,
  PROP_ADD_BUTTON,
  propDeleteButton,
  propValueInput,
} from '../support/helpers/selectors.js'

When('{int} 番目のフィーチャアイテムをクリックする', async function (this: CustomWorld, index: number) {
  const item = this.page.locator(GEOJSON_FEATURE_ITEM).nth(index - 1)
  await item.click()
  await this.page.waitForTimeout(300)
})

Then('プロパティエディタが表示されている', async function (this: CustomWorld) {
  await expect(this.page.locator(FEATURE_PROPS_EDITOR)).toBeVisible()
})

Then('プロパティエディタが表示されていない', async function (this: CustomWorld) {
  await expect(this.page.locator(FEATURE_PROPS_EDITOR)).toHaveCount(0)
})

When('プロパティキーに {string} を入力する', async function (this: CustomWorld, key: string) {
  await this.page.locator(PROP_KEY_INPUT).fill(key)
})

When('プロパティ値に {string} を入力する', async function (this: CustomWorld, value: string) {
  await this.page.locator(PROP_VALUE_INPUT).fill(value)
})

When('プロパティ追加ボタンをクリックする', async function (this: CustomWorld) {
  await this.page.locator(PROP_ADD_BUTTON).click()
  await this.page.waitForTimeout(200)
})

When('プロパティ {string} の削除ボタンをクリックする', async function (this: CustomWorld, key: string) {
  await this.page.locator(propDeleteButton(key)).click()
  await this.page.waitForTimeout(200)
})

When('プロパティ {string} の値を {string} に変更する', async function (this: CustomWorld, key: string, value: string) {
  await this.page.locator(propValueInput(key)).fill(value)
  await this.page.waitForTimeout(200)
})

Then('GeoJSONテキストエリアに {string} が含まれない', async function (this: CustomWorld, text: string) {
  const value = await this.page.locator(GEOJSON_TEXTAREA).inputValue()
  expect(value).not.toContain(text)
})
