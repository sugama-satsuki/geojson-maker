/** MapLibre の描画キャンバス */
export const MAP_CANVAS = '.map canvas'

/** 描画モード選択ボタン */
export const MODE_BUTTON = '.draw-mode-selector__button'
export const MODE_BUTTON_SELECTED = '.draw-mode-selector__button--selected'

/** data-mode 属性でボタンを特定 */
export const modeButtonSelector = (dataMode: string) =>
  `.draw-mode-selector__button[data-mode="${dataMode}"]`

/** 描画コントロールパネル */
export const DRAW_CONTROL_PANEL = '.draw-control-panel'
export const HELPER_TEXT = '.draw-control-panel__helper'
export const DRAFT_SECTION = '.draw-control-panel__draft'
export const DRAFT_TEXT = '.draw-control-panel__draft-text'
export const DRAFT_BUTTON = '.draw-control-panel__draft-button'
export const CLEAR_BUTTON = '.draw-control-panel__clear-button'
export const FEATURES_COUNT = '.draw-control-panel__count'

/** GeoJSON パネル */
export const GEOJSON_PANEL = '.geojson-panel'
export const GEOJSON_TEXTAREA = '.geojson-panel__textarea'
export const GEOJSON_PANEL_COUNT = '.geojson-panel__count'
export const GEOJSON_PANEL_BUTTON = '.geojson-panel__button'
