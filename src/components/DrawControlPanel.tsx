import { DrawMode, DrawModeSelector } from './DrawModeSelector'
import './DrawControlPanel.css'

type DrawControlPanelProps = {
  drawMode: DrawMode
  isDrawingPath: boolean
  canFinalizeDraft: boolean
  hasSelectedFeature: boolean
  onChangeMode: (mode: DrawMode) => void
  onFinalize: () => void
  onDeleteFeature: () => void
}

export function DrawControlPanel({
  drawMode,
  isDrawingPath,
  canFinalizeDraft,
  hasSelectedFeature,
  onChangeMode,
  onFinalize,
  onDeleteFeature,
}: DrawControlPanelProps) {
  return (
    <div className='draw-control-panel'>
      <DrawModeSelector selectedMode={drawMode} onChange={onChangeMode} />
      <button
        type='button'
        onClick={onDeleteFeature}
        disabled={!hasSelectedFeature}
        title='追加した地物をクリックして削除'
        className={`draw-control-panel__action-button draw-control-panel__action-button--delete${hasSelectedFeature ? '' : ' draw-control-panel__action-button--disabled'}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
      {isDrawingPath && (
        <button
          type='button'
          onClick={onFinalize}
          disabled={!canFinalizeDraft}
          title='ドラフトを確定'
          className={`draw-control-panel__action-button draw-control-panel__action-button--confirm${canFinalizeDraft ? '' : ' draw-control-panel__action-button--disabled'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
