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
export const DELETE_ACTION_BUTTON = '.draw-control-panel__action-button--delete'
export const CONFIRM_ACTION_BUTTON = '.draw-control-panel__action-button--confirm'

/** GeoJSON パネル */
export const GEOJSON_PANEL = '.geojson-panel'
export const GEOJSON_TEXTAREA = '.geojson-panel__textarea'
export const GEOJSON_PANEL_COUNT = '.geojson-panel__count'
export const GEOJSON_PANEL_BUTTON = '.geojson-panel__button'
