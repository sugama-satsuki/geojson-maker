import { describe, it, expect } from 'vitest'
import { HELP_SECTIONS, formatShortcut, getShortcutItems } from '../help-content'

describe('HELP_SECTIONS', () => {
  it('4つのセクションを持つ', () => {
    expect(HELP_SECTIONS).toHaveLength(4)
  })

  it('各セクションに title と items が存在する', () => {
    for (const section of HELP_SECTIONS) {
      expect(section.title).toBeTruthy()
      expect(section.items.length).toBeGreaterThan(0)
    }
  })

  it('各アイテムに label と description が存在する', () => {
    for (const section of HELP_SECTIONS) {
      for (const item of section.items) {
        expect(item.label).toBeTruthy()
        expect(item.description).toBeTruthy()
      }
    }
  })

  it('「操作・ショートカット」セクションのアイテムに shortcut が含まれる', () => {
    const section = HELP_SECTIONS.find((s) => s.title === '操作・ショートカット')
    expect(section).toBeDefined()
    const withShortcut = section!.items.filter((i) => i.shortcut)
    expect(withShortcut.length).toBeGreaterThan(0)
  })
})

describe('formatShortcut', () => {
  it('Mac でない場合はそのまま返す', () => {
    expect(formatShortcut('Ctrl+Z', false)).toBe('Ctrl+Z')
    expect(formatShortcut('Ctrl+Shift+Z', false)).toBe('Ctrl+Shift+Z')
  })

  it('Mac の場合: Ctrl → ⌘、Shift → ⇧、Alt → ⌥ に変換し + を除去する', () => {
    expect(formatShortcut('Ctrl+Z', true)).toBe('⌘Z')
    expect(formatShortcut('Ctrl+Shift+Z', true)).toBe('⌘⇧Z')
    expect(formatShortcut('Alt+F4', true)).toBe('⌥F4')
  })

  it('変換対象キーを含まない文字列はそのまま返す（Mac でも）', () => {
    expect(formatShortcut('Z', true)).toBe('Z')
    expect(formatShortcut('Escape', true)).toBe('Escape')
  })
})

describe('getShortcutItems', () => {
  it('Windows 向けに Ctrl+Z / Ctrl+Shift+Z ショートカットを返す', () => {
    const items = getShortcutItems(false)
    expect(items).toHaveLength(2)
    expect(items[0].shortcut).toBe('Ctrl+Z')
    expect(items[1].shortcut).toBe('Ctrl+Shift+Z')
  })

  it('Mac 向けに ⌘Z / ⌘⇧Z ショートカットを返す', () => {
    const items = getShortcutItems(true)
    expect(items).toHaveLength(2)
    expect(items[0].shortcut).toBe('⌘Z')
    expect(items[1].shortcut).toBe('⌘⇧Z')
  })

  it('各アイテムに label と description が存在する', () => {
    for (const item of getShortcutItems(false)) {
      expect(item.label).toBeTruthy()
      expect(item.description).toBeTruthy()
    }
  })
})
