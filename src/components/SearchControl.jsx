import { useState } from 'react'

export default function SearchControl({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const search = async () => {
    if (!query.trim()) {
      setResults([])
      setShowResults(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await res.json()
      setResults(data)
      setShowResults(data.length > 0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }

  const choose = (item) => {
    const latlng = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
    onSelect(latlng)
    setResults([])
    setShowResults(false)
    setQuery(item.display_name)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      search()
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  return (
    <div className="search-control">
      <div className="searchbar">
        <input
          type="text"
          placeholder="Search for a place..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          aria-label="Search location"
        />
        <button
          className="btn btn-primary"
          type="button"
          onClick={search}
          disabled={loading}
          aria-label="Search"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {showResults && results.length > 0 && (
        <div className="suggestions" role="listbox">
          {results.map((r) => (
            <div
              key={r.place_id}
              className="suggestion-item"
              onClick={() => choose(r)}
              onKeyDown={(e) => e.key === 'Enter' && choose(r)}
              role="option"
              tabIndex={0}
            >
              <span className="suggestion-name">{r.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
