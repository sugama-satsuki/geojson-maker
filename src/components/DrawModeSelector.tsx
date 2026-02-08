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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6 }}>
      {DRAW_MODES.map((mode) => {
        const isSelected = mode === selectedMode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.2)',
              background: isSelected ? '#1a73e8' : '#fff',
              color: isSelected ? '#fff' : '#111',
              fontWeight: isSelected ? 600 : 500,
              cursor: 'pointer'
            }}
          >
            {DRAW_MODE_LABELS[mode]}
          </button>
        )
      })}
    </div>
  )
}
