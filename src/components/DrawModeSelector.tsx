import './DrawModeSelector.css'
import { DRAW_MODE_ICONS } from './DrawModeIcons'

export type DrawMode = 'point' | 'line' | 'polygon' | 'symbol'

const DRAW_MODE_LABELS: Record<DrawMode, string> = {
  point: 'ポイント',
  line: 'ライン',
  polygon: 'ポリゴン',
  symbol: 'シンボル'
}

const DRAW_MODES: DrawMode[] = ['point', 'line', 'polygon', 'symbol']

type DrawModeSelectorProps = {
  selectedMode: DrawMode
  onChange: (mode: DrawMode) => void
}

export function DrawModeSelector({ selectedMode, onChange }: DrawModeSelectorProps) {
  return (
    <div className='draw-mode-selector'>
      {DRAW_MODES.map((mode) => {
        const isSelected = mode === selectedMode
        const Icon = DRAW_MODE_ICONS[mode]
        const label = DRAW_MODE_LABELS[mode]
        return (
          <button
            key={mode}
            type='button'
            data-mode={mode}
            aria-label={label}
            title={label}
            onClick={() => onChange(mode)}
            className={`draw-mode-selector__button${isSelected ? ' draw-mode-selector__button--selected' : ''}`}
          >
            <Icon />
          </button>
        )
      })}
    </div>
  )
}
