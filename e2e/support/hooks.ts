import { BeforeAll, AfterAll, Before, After, setWorldConstructor } from '@cucumber/cucumber'
import { chromium, Browser } from '@playwright/test'
import { ChildProcess, spawn } from 'child_process'
import { CustomWorld } from './world.js'
import { DRAW_CONTROL_PANEL } from './helpers/selectors.js'
import { waitForMapReady } from './helpers/map-helpers.js'

setWorldConstructor(CustomWorld)

const USE_PREVIEW = process.env.E2E_PREVIEW === 'true'
const APP_PORT = USE_PREVIEW ? '4173' : '5173'
const APP_URL = `http://localhost:${APP_PORT}`
let viteProcess: ChildProcess
let sharedBrowser: Browser

/**
 * ベースマップを描画しない最小スタイル。
 * タイルの読み込み・WebGL 描画をスキップし、CI の SwiftShader 環境でも即座にロードする。
 * テスト対象（描画操作・GeoJSON 出力）には影響しない。
 */
const BLANK_STYLE = JSON.stringify({
  version: 8,
  name: 'Blank',
  sources: {},
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#f0f0f0' } },
  ],
})

/**
 * テスト全体の前に Vite サーバとブラウザを起動する
 */
BeforeAll({ timeout: 60000 }, async function () {
  // Vite サーバ起動（preview モードまたは dev モード）
  const viteArgs = USE_PREVIEW
    ? ['vite', 'preview', '--port', APP_PORT]
    : ['vite', '--port', APP_PORT]

  viteProcess = spawn('npx', viteArgs, {
    cwd: process.cwd(),
    stdio: 'pipe',
    shell: true,
    detached: true,
  })

  // サーバが応答するまでポーリング
  let serverReady = false
  const maxRetries = 30
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(APP_URL)
      if (res.ok) {
        serverReady = true
        break
      }
    } catch {
      // まだ起動中
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  if (!serverReady) {
    throw new Error('Vite サーバの起動がタイムアウトしました')
  }

  // ブラウザを1回だけ起動（全シナリオで共有）
  const headless = process.env.HEADLESS !== 'false'
  sharedBrowser = await chromium.launch({
    headless,
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
    ],
  })
})

/**
 * テスト全体の後にブラウザと Vite サーバを停止する
 */
AfterAll(async function () {
  await sharedBrowser?.close()
  if (viteProcess?.pid) {
    try {
      // detached プロセスグループごと終了（sh → npx → vite すべて）
      process.kill(-viteProcess.pid, 'SIGTERM')
    } catch {
      // プロセスが既に終了している場合
    }
  }
})

/**
 * 各シナリオの前に新しいコンテキストとページを作成する
 */
Before({ timeout: 60000 }, async function (this: CustomWorld) {
  this.context = await sharedBrowser.newContext({
    viewport: { width: 1280, height: 720 },
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  this.page = await this.context.newPage()

  // ベースマップのスタイルを空に差し替え（タイル描画の負荷を排除）
  await this.page.route(/style\.json/, (route) =>
    route.fulfill({ contentType: 'application/json', body: BLANK_STYLE }),
  )

  // Geolonia CDN・API へのリクエストをスタブ化（E2E 環境では maplibre-gl にフォールバック）
  await this.page.route(/cdn\.geolonia\.com/, (route) =>
    route.fulfill({ contentType: 'application/javascript', body: '/* noop */' }),
  )
  await this.page.route(/api\.geolonia\.com/, (route) =>
    route.fulfill({ contentType: 'application/json', body: '{}' }),
  )

  await this.page.goto(APP_URL)
  await this.page.waitForSelector(DRAW_CONTROL_PANEL, { state: 'visible', timeout: 30000 })
  await waitForMapReady(this.page)
})

/**
 * 各シナリオの後にコンテキストを閉じる（ブラウザは維持）
 */
After(async function (this: CustomWorld) {
  await this.context?.close()
})
