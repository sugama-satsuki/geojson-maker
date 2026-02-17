import { useState } from 'react'
import { getUserProperties, validatePropertyKey } from '../lib/property-helpers'

type Props = {
  properties: GeoJSON.GeoJsonProperties
  onUpdate: (userProperties: Record<string, string>) => void
}

export function FeaturePropertiesEditor({ properties, onUpdate }: Props) {
  const userProps = getUserProperties(properties)
  const entries = Object.entries(userProps)

  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const err = validatePropertyKey(newKey, entries.map(([k]) => k))
    if (err) {
      setError(err)
      return
    }
    onUpdate({ ...userProps, [newKey.trim()]: newValue })
    setNewKey('')
    setNewValue('')
    setError(null)
  }

  const handleDelete = (key: string) => {
    const next = { ...userProps }
    delete next[key]
    onUpdate(next)
  }

  const handleValueChange = (key: string, value: string) => {
    onUpdate({ ...userProps, [key]: value })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="feature-props-editor" data-testid="feature-props-editor">
      {entries.map(([key, value]) => (
        <div key={key} className="feature-props-editor__row" data-prop-key={key}>
          <span className="feature-props-editor__key">{key}</span>
          <input
            type="text"
            className="feature-props-editor__value-input"
            value={value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            data-testid={`prop-value-${key}`}
          />
          <button
            type="button"
            className="feature-props-editor__delete-btn"
            onClick={() => handleDelete(key)}
            data-testid={`prop-delete-${key}`}
            aria-label={`${key}を削除`}
          >
            &times;
          </button>
        </div>
      ))}

      <div className="feature-props-editor__add-row">
        <input
          type="text"
          className="feature-props-editor__key-input"
          placeholder="キー"
          value={newKey}
          onChange={(e) => { setNewKey(e.target.value); setError(null) }}
          onKeyDown={handleKeyDown}
          data-testid="prop-key-input"
        />
        <input
          type="text"
          className="feature-props-editor__new-value-input"
          placeholder="値"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid="prop-value-input"
        />
        <button
          type="button"
          className="feature-props-editor__add-btn"
          onClick={handleAdd}
          data-testid="prop-add-button"
          aria-label="プロパティを追加"
        >
          +
        </button>
      </div>

      {error && (
        <div className="feature-props-editor__error" data-testid="prop-error">
          {error}
        </div>
      )}
    </div>
  )
}
