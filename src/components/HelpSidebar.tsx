import { useEffect, useRef } from 'react'
import { HELP_SECTIONS, getShortcutItems } from '../lib/help-content'
import './HelpSidebar.css'

type HelpSidebarProps = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export function HelpSidebar({ isOpen, onOpen, onClose }: HelpSidebarProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const isMac = /mac/i.test(navigator.userAgent)
  const shortcutItems = getShortcutItems(isMac)

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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
    <>
      {!isOpen && (
        <button
          type='button'
          className='help-tab'
          onClick={onOpen}
          aria-label='使い方を見る'
        >
          <svg className='help-tab__icon' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          使い方
        </button>
      )}

      {isOpen && (
        <div
          className='help-sidebar'
          role='dialog'
          aria-modal='true'
          aria-labelledby='help-sidebar-title'
        >
          <div className='help-sidebar__header'>
            <h2 id='help-sidebar-title' className='help-sidebar__title'>使い方ガイド</h2>
            <button
              type='button'
              ref={closeButtonRef}
              className='help-sidebar__close'
              onClick={onClose}
              aria-label='閉じる'
            >
              ✕
            </button>
          </div>

          <div className='help-sidebar__content'>
            {sections.map((section) => (
              <div key={section.title} className='help-sidebar__section'>
                <h3 className='help-sidebar__section-title'>{section.title}</h3>
                {section.items.map((item) => (
                  <div key={item.label} className='help-sidebar__item'>
                    <span className='help-sidebar__item-label'>{item.label}</span>
                    <span className='help-sidebar__item-description'>{item.description}</span>
                    {item.shortcut && (
                      <span className='help-sidebar__item-shortcut'>{item.shortcut}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
