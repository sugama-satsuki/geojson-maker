import { When, Then, DataTable } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { CustomWorld } from '../support/world.js'
import { GEOJSON_PANEL_BUTTON } from '../support/helpers/selectors.js'
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

Then('{string} ボタンが表示されている', async function (this: CustomWorld, buttonText: string) {
  const button = this.page.locator(GEOJSON_PANEL_BUTTON, { hasText: buttonText })
  await expect(button).toBeVisible()
})
