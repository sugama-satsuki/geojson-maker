import { useEffect, useRef } from 'react'
import { getFeatureCenter } from '../lib/feature-center'
import { getUserProperties } from '../lib/property-helpers'
import './FeatureContextMenu.css'

type FeatureContextMenuProps = {
  feature: GeoJSON.Feature
  position: { x: number; y: number }
  onClose: () => void
}

export function FeatureContextMenu({ feature, position, onClose }: FeatureContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const copyCoordinates = async () => {
    const center = getFeatureCenter(feature)
    if (!center) return
    const text = `${center[1]}, ${center[0]}`
    await navigator.clipboard.writeText(text)
    onClose()
  }

  const copyProperties = async () => {
    const userProps = getUserProperties(feature.properties)
    const text = JSON.stringify(userProps, null, 2)
    await navigator.clipboard.writeText(text)
    onClose()
  }

  const geomType = feature.geometry.type
  const coordLabel = geomType === 'Point' ? '座標をコピー' : '中心座標をコピー'

  return (
    <div
      ref={menuRef}
      className='feature-context-menu'
      style={{ left: position.x, top: position.y }}
    >
      <button type='button' className='feature-context-menu__item' onClick={copyCoordinates}>
        {coordLabel}
      </button>
      <button type='button' className='feature-context-menu__item' onClick={copyProperties}>
        属性情報をコピー
      </button>
    </div>
  )
}
