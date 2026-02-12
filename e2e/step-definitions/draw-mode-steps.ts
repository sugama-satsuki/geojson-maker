import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import {
  MODE_BUTTON_SELECTED,
  modeButtonSelector,
} from '../support/helpers/selectors.js'

/** 日本語モード名 → data-mode 値 */
const MODE_NAME_TO_DATA: Record<string, string> = {
  ポイント: 'point',
  ライン: 'line',
  ポリゴン: 'polygon',
  シンボル: 'symbol',
}

function toDataMode(modeName: string): string {
  const dataMode = MODE_NAME_TO_DATA[modeName]
  if (!dataMode) throw new Error(`Unknown mode name: ${modeName}`)
  return dataMode
}

/**
 * Given/Then 両方で使える: 現在の選択状態を確認し、必要ならクリックして選択する
 */
Given('{string} モードが選択されている', async function (this: CustomWorld, modeName: string) {
  const dataMode = toDataMode(modeName)
  const selected = this.page.locator(MODE_BUTTON_SELECTED)
  const selectedDataMode = await selected.getAttribute('data-mode')
  if (selectedDataMode === dataMode) return

  // まだ選択されていなければクリック
  const button = this.page.locator(modeButtonSelector(dataMode))
  await button.click()
  await expect(button).toHaveClass(/draw-mode-selector__button--selected/)
})

When('{string} モードを選択する', async function (this: CustomWorld, modeName: string) {
  const dataMode = toDataMode(modeName)
  const button = this.page.locator(modeButtonSelector(dataMode))
  await button.click()
  await expect(button).toHaveClass(/draw-mode-selector__button--selected/)
})

Then('選択中のモードが {string} である', async function (this: CustomWorld, modeName: string) {
  const dataMode = toDataMode(modeName)
  const selected = this.page.locator(MODE_BUTTON_SELECTED)
  await expect(selected).toHaveAttribute('data-mode', dataMode)
})

