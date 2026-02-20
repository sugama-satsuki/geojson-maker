import { useEffect } from 'react'
import { HELP_SECTIONS, getShortcutItems } from '../lib/help-content'
import './HelpModal.css'

type HelpModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const isMac = /mac/i.test(navigator.userAgent)
  const shortcutItems = getShortcutItems(isMac)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // ショートカットセクションのアイテムをOS向けに差し替え
  const sections = HELP_SECTIONS.map((section) =>
    section.title === '操作・ショートカット'
      ? {
          ...section,
          items: section.items.map((item) => {
            const sc = shortcutItems.find((s) => s.label === item.label)
            return sc ? { ...item, shortcut: sc.shortcut } : item
          }),
        }
      : section,
  )

  return (
    <div
      className='help-modal-overlay'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label='使い方ガイド'
    >
      <div className='help-modal' onClick={(e) => e.stopPropagation()}>
        <div className='help-modal__header'>
          <h2 className='help-modal__title'>使い方ガイド</h2>
          <button
            type='button'
            className='help-modal__close'
            onClick={onClose}
            aria-label='閉じる'
          >
            ✕
          </button>
        </div>

        {sections.map((section) => (
          <div key={section.title} className='help-modal__section'>
            <h3 className='help-modal__section-title'>{section.title}</h3>
            {section.items.map((item) => (
              <div key={item.label} className='help-modal__item'>
                <span className='help-modal__item-label'>{item.label}</span>
                <span className='help-modal__item-description'>{item.description}</span>
                {item.shortcut && (
                  <span className='help-modal__item-shortcut'>{item.shortcut}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
