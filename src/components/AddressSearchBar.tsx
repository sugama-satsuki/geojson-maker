import { useCallback, useState } from 'react'
import { normalize } from '@geolonia/normalize-japanese-addresses'
import './AddressSearchBar.css'

type AddressSearchBarProps = {
  onSearch: (lat: number, lng: number) => void
}

const LEVEL_LABELS: Record<number, string> = {
  0: '都道府県を判別できませんでした',
  1: '都道府県レベルの精度です',
  2: '市区町村レベルの精度です',
  3: '丁目・町字レベルの精度です',
}

export function AddressSearchBar({ onSearch }: AddressSearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    setError(null)
    setWarning(null)

    try {
      const result = await normalize(trimmed)

      if (!result.point || result.level === 0) {
        setError('住所が見つかりませんでした')
        return
      }

      if (result.level !== 8) {
        setWarning(LEVEL_LABELS[result.level] ?? `正規化レベル: ${result.level}`)
      }

      onSearch(result.point.lat, result.point.lng)
    } catch {
      setError('住所の検索に失敗しました')
    } finally {
      setIsSearching(false)
    }
  }, [query, onSearch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  return (
    <div className="address-search-bar">
      <input
        type="text"
        className="address-search-bar__input"
        placeholder="住所を検索..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setError(null)
          setWarning(null)
        }}
        onKeyDown={handleKeyDown}
        disabled={isSearching}
      />
      <button
        type="button"
        className="address-search-bar__button"
        onClick={handleSearch}
        disabled={isSearching || !query.trim()}
        title="検索"
        aria-label="住所を検索"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      {error && <div className="address-search-bar__message address-search-bar__message--error">{error}</div>}
      {warning && <div className="address-search-bar__message address-search-bar__message--warning">{warning}</div>}
    </div>
  )
}
