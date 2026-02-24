// CSS (side-effect import)
import './drawing-engine.css'

// Components
export { DrawControlPanel } from './components/DrawControlPanel'
export type { DrawControlPanelProps } from './components/DrawControlPanel'
export { DrawModeSelector } from './components/DrawModeSelector'
export { DRAW_MODE_ICONS } from './components/DrawModeIcons'

// Main hook
export { useDrawingEngine } from './hooks/useDrawingEngine'
export type { DrawingEngineOptions, DrawingEngineResult, ContextMenuEvent } from './hooks/useDrawingEngine'

// Sub hooks
export { useUndoable } from './hooks/useUndoable'
export { useVertexEditing } from './hooks/useVertexEditing'

// Utilities
export {
  createPointFeature,
  createPathFeature,
  createDraftFeatureCollection,
  parseGeoJSONImport,
  nextFeatureId,
  closePolygonRing,
} from './lib/geojson-helpers'
export { parseCSV } from './lib/csv-helpers'
export { clampPosition } from './lib/clamp-position'

// Types
export type { DrawMode, PathMode } from './types'
