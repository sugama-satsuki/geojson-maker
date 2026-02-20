import { When } from '@cucumber/cucumber'
import { CustomWorld } from '../support/world.js'
import { dragMapAtOffset } from '../support/helpers/map-helpers.js'

When(
  '地図の中央から右に {int}px の位置の頂点を右に {int}px ドラッグする',
  { timeout: 20000 },
  async function (this: CustomWorld, fromOffsetX: number, dragPx: number) {
    await dragMapAtOffset(this.page, fromOffsetX, 0, fromOffsetX + dragPx, 0)
  }
)
