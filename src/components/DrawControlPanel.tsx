import { DrawMode, DrawModeSelector } from './DrawModeSelector'
import './DrawControlPanel.css'

type DrawControlPanelProps = {
  drawMode: DrawMode
  isDrawingPath: boolean
  draftCount: number
  canFinalizeDraft: boolean
  onChangeMode: (mode: DrawMode) => void
  onFinalize: () => void
  onClearDraft: () => void
  featuresCount: number
}

export function DrawControlPanel({
  drawMode,
  isDrawingPath,
  draftCount,
  canFinalizeDraft,
  onChangeMode,
  onFinalize,
  onClearDraft,
  featuresCount
}: DrawControlPanelProps) {
  return (
    <div className='draw-control-panel'>
      <div className='draw-control-panel__header'>描画モード</div>
      <DrawModeSelector selectedMode={drawMode} onChange={onChangeMode} />
      {isDrawingPath && (
        <div className='draw-control-panel__draft'>
          <div className='draw-control-panel__draft-text'>
            {draftCount === 0 ? 'クリックで頂点を追加してください。' : `${draftCount} 点を記録中`}
          </div>
          <div className='draw-control-panel__draft-actions'>
            <button
              type='button'
              onClick={onFinalize}
              disabled={!canFinalizeDraft}
              className={`draw-control-panel__draft-button${canFinalizeDraft ? '' : ' draw-control-panel__draft-button--disabled'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              確定
            </button>
            <button
              type='button'
              onClick={onClearDraft}
              className='draw-control-panel__clear-button'
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              クリア
            </button>
          </div>
        </div>
      )}
      <div className='draw-control-panel__count'>{`生成済みGeoJSON: ${featuresCount} 件`}</div>
    </div>
  )
}
