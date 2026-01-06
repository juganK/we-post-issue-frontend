import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import SearchControl from './SearchControl'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function LocationMarker({ position, onPositionChange }) {
  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
    locationfound(e) {
      onPositionChange(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    }
  })

  useEffect(() => {
    map.locate()
  }, [map])

  return position ? <Marker position={position} /> : null
}

function MapController({ position, onPositionChange }) {
  const map = useMap()
  
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15)
    }
  }, [position, map])
  
  return null
}

export default function MapSection({ position, onPositionChange }) {
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          onPositionChange(newPosition)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please select a location on the map.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleClearPin = () => {
    onPositionChange(null)
  }

  const handleSearchSelect = (latlng) => {
    onPositionChange(latlng)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Location</h2>
        <div className="controls">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLocateMe}
            aria-label="Use my current location"
          >
            Locate Me
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleClearPin}
            disabled={!position}
            aria-label="Clear location pin"
          >
            Clear Pin
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="search-wrapper">
          <SearchControl onSelect={handleSearchSelect} />
        </div>
        <div className="map-container">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController position={position} onPositionChange={onPositionChange} />
            <LocationMarker position={position} onPositionChange={onPositionChange} />
          </MapContainer>
        </div>
        {position && (
          <div className="coordinates-info">
            <small>
              Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </small>
          </div>
        )}
      </div>
    </div>
  )
}
