import { When, Then, DataTable } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { GEOJSON_PANEL } from '../support/helpers/selectors.js'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

When('CSVファイルをインポートする:', async function (this: CustomWorld, dataTable: DataTable) {
  const rows = dataTable.raw()
  const csvContent = rows.map((row) => row.join(',')).join('\n')

  // 一時ファイルにCSVを書き出す
  const tmpFile = path.join(os.tmpdir(), `test-import-${Date.now()}.csv`)
  fs.writeFileSync(tmpFile, csvContent, 'utf-8')

  // hidden input[type=file] にファイルをセット
  const fileInput = this.page.locator('input[type="file"][accept=".csv"]')
  await fileInput.setInputFiles(tmpFile)

  // インポート処理の完了を待つ
  await this.page.waitForTimeout(500)

  // 一時ファイルを削除
  fs.unlinkSync(tmpFile)
})

Then('GeoJSONパネルにインポートアイコンが表示されている', async function (this: CustomWorld) {
  const button = this.page.locator(`${GEOJSON_PANEL} .geojson-panel__header-button[aria-label="インポート"]`)
  await expect(button).toBeVisible()
})

When('インポートアイコンにホバーする', async function (this: CustomWorld) {
  const button = this.page.locator(`${GEOJSON_PANEL} .geojson-panel__header-button[aria-label="インポート"]`)
  await button.hover()
})

Then('インポートポップアップに {string} が表示されている', async function (this: CustomWorld, buttonText: string) {
  const popup = this.page.locator(`${GEOJSON_PANEL} .geojson-panel__import-popup-btn`, { hasText: buttonText })
  await expect(popup).toBeVisible()
})
