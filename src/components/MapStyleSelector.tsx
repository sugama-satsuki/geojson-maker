import { useState, useEffect, useRef } from 'react'
import './MapStyleSelector.css'

export interface MapStyle {
  id: string
  label: string
  color: string
}

export const MAP_STYLES: MapStyle[] = [
  { id: 'geolonia/basic-v2', label: 'Basic v2', color: '#e8e4da' },
  { id: 'geolonia/basic-v1', label: 'Basic v1', color: '#e8e4da' },
  { id: 'geolonia/basic', label: 'Basic', color: '#e8e4da' },
  { id: 'geolonia/gsi', label: 'GSI', color: '#d9ceab' },
  { id: 'geolonia/homework', label: 'Homework', color: '#f5f5f0' },
  { id: 'geolonia/midnight', label: 'Midnight', color: '#1a1a2e' },
  { id: 'geolonia/notebook', label: 'Notebook', color: '#fdf6e3' },
  { id: 'geolonia/red-planet', label: 'Red Planet', color: '#2d1117' },
]

interface MapStyleSelectorProps {
  currentStyle: string
  onStyleChange: (style: string) => void
}

export const MapStyleSelector: React.FC<MapStyleSelectorProps> = ({ currentStyle, onStyleChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const currentStyleObj = MAP_STYLES.find((s) => s.id === currentStyle)

  const handleSelect = (styleId: string) => {
    onStyleChange(styleId)
    setIsOpen(false)
  }

  return (
    <div className="map-style-selector" ref={panelRef}>
      <button
        className="map-style-selector__toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        title="背景地図を切り替え"
        aria-label="背景地図を切り替え"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <span className="map-style-selector__toggle-label">{currentStyleObj?.label ?? 'Style'}</span>
      </button>

      {isOpen && (
        <div className="map-style-selector__panel">
          {MAP_STYLES.map((style) => (
            <button
              key={style.id}
              className={`map-style-selector__item${style.id === currentStyle ? ' map-style-selector__item--selected' : ''}`}
              onClick={() => handleSelect(style.id)}
            >
              <div
                className="map-style-selector__thumb"
                style={{ backgroundColor: style.color }}
              >
                {style.color === '#1a1a2e' || style.color === '#2d1117' ? (
                  <svg className="map-style-selector__thumb-icon map-style-selector__thumb-icon--light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  </svg>
                ) : (
                  <svg className="map-style-selector__thumb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  </svg>
                )}
              </div>
              <span className="map-style-selector__item-label">{style.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
