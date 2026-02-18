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
export const DRAW_CONTROL_GRIP = '.draw-control-panel__grip'
export const DELETE_ACTION_BUTTON = '.draw-control-panel__action-button--delete'
export const CONFIRM_ACTION_BUTTON = '.draw-control-panel__action-button--confirm'

/** GeoJSON パネル */
export const GEOJSON_PANEL = '.geojson-panel'
export const GEOJSON_TEXTAREA = '.geojson-panel__textarea'
export const GEOJSON_PANEL_COUNT = '.geojson-panel__count'
export const GEOJSON_PANEL_BUTTON = '.geojson-panel__button'
export const GEOJSON_FEATURE_ITEM = '.geojson-panel__feature-item'
export const GEOJSON_FEATURE_ITEM_HIGHLIGHTED = '.geojson-panel__feature-item--highlighted'

/** コンテキストメニュー */
export const FEATURE_CONTEXT_MENU = '.feature-context-menu'
export const FEATURE_CONTEXT_MENU_ITEM = '.feature-context-menu__item'

/** インポート */
export const IMPORT_ACTION_BUTTON = '.draw-control-panel__action-button--import'
export const IMPORT_POPUP_BTN = '.draw-control-panel__import-popup-btn'

/** 住所検索バー */
export const ADDRESS_SEARCH_BAR = '.address-search-bar'
export const ADDRESS_SEARCH_INPUT = '.address-search-bar__input'
export const ADDRESS_SEARCH_BUTTON = '.address-search-bar__button'
export const ADDRESS_SEARCH_ERROR = '.address-search-bar__message--error'
export const ADDRESS_SEARCH_WARNING = '.address-search-bar__message--warning'

/** プロパティエディタ */
export const FEATURE_PROPS_EDITOR = '[data-testid="feature-props-editor"]'
export const PROP_KEY_INPUT = '[data-testid="prop-key-input"]'
export const PROP_VALUE_INPUT = '[data-testid="prop-value-input"]'
export const PROP_ADD_BUTTON = '[data-testid="prop-add-button"]'
export const propDeleteButton = (key: string) => `[data-testid="prop-delete-${key}"]`
export const propValueInput = (key: string) => `[data-testid="prop-value-${key}"]`
