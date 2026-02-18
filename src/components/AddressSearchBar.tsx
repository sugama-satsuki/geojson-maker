import { useCallback, useState } from 'react'
import './AddressSearchBar.css'

type AddressSearchBarProps = {
  onSearch: (lat: number, lng: number) => void
}

type NominatimResult = {
  lat: string
  lon: string
}

export function AddressSearchBar({ onSearch }: AddressSearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    setError(null)

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`
      const res = await fetch(url)
      if (!res.ok) throw new Error('検索に失敗しました')

      const data: NominatimResult[] = await res.json()
      if (data.length === 0) {
        setError('住所が見つかりませんでした')
        return
      }

      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      onSearch(lat, lng)
    } catch {
      setError('住所が見つかりませんでした')
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
      {error && <div className="address-search-bar__error">{error}</div>}
    </div>
  )
}
