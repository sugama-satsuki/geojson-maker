import { When } from '@cucumber/cucumber'
import { CustomWorld } from '../support/world.js'
import { shiftClickMapAtOffset, dragMapAtOffset } from '../support/helpers/map-helpers.js'

When('地図の中央から右に {int}px の位置をShiftクリックする', async function (this: CustomWorld, px: number) {
  await shiftClickMapAtOffset(this.page, px, 0)
})

When('地図の中央から左に {int}px の位置をShiftクリックする', async function (this: CustomWorld, px: number) {
  await shiftClickMapAtOffset(this.page, -px, 0)
})

When('地図上でラバーバンド選択する', async function (this: CustomWorld) {
  // 両方の地物（-50px と +50px）を囲む大きめのラバーバンドドラッグ
  await dragMapAtOffset(this.page, -100, -60, 100, 60)
})
