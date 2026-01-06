import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

// Red marker for issue location
const IssueLocationIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  className: 'issue-location-marker'
})

function MapCenterController({ center, shouldRecenter }) {
  const map = useMap()
  
  useEffect(() => {
    if (center && map && shouldRecenter) {
      // Use invalidateSize to ensure map renders properly when container becomes visible
      setTimeout(() => {
        map.invalidateSize()
        const currentZoom = map.getZoom()
        const targetZoom = Math.max(currentZoom, 15)
        map.setView([center.lat, center.lng], targetZoom, {
          animate: false
        })
      }, 100)
    }
  }, [center, map, shouldRecenter])
  
  return null
}

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

function DraggableMarker({ position, onPositionChange }) {
  const [draggedPosition, setDraggedPosition] = useState(position)

  useEffect(() => {
    setDraggedPosition(position)
  }, [position])

  const handleDragEnd = (e) => {
    const marker = e.target
    const newPosition = marker.getLatLng()
    const positionObj = { lat: newPosition.lat, lng: newPosition.lng }
    setDraggedPosition(positionObj)
    onPositionChange(positionObj)
  }

  return (
    <Marker
      position={[draggedPosition.lat, draggedPosition.lng]}
      icon={IssueLocationIcon}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd
      }}
    />
  )
}

function LocationPicker({ initialLocation, defaultCenter, onLocationChange, onResetToCurrent }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [shouldRecenter, setShouldRecenter] = useState(true)
  const [mapKey, setMapKey] = useState(0)

  useEffect(() => {
    // Only update if the location has actually changed from the parent side
    // This prevents re-centering when the update came from our own handleLocationChange
    if (initialLocation && selectedLocation) {
      if (initialLocation.lat !== selectedLocation.lat || initialLocation.lng !== selectedLocation.lng) {
        setSelectedLocation(initialLocation)
        setShouldRecenter(true)
      }
    } else if (initialLocation !== selectedLocation) {
      setSelectedLocation(initialLocation)
      setShouldRecenter(true)
    }
  }, [initialLocation])

  const handleLocationChange = (location) => {
    setSelectedLocation(location)
    setShouldRecenter(false) // Don't recenter the map when user manually moves the marker
    onLocationChange(location)
  }

  const handleReset = () => {
    if (onResetToCurrent) {
      onResetToCurrent()
      // The parent will update initialLocation, which triggers the useEffect above
    }
  }

  const mapCenter = selectedLocation || defaultCenter || { lat: 20.5937, lng: 78.9629 } // Default to India if nothing else

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <label>Select Issue Location</label>
      </div>
      <div className="location-map-wrapper" style={{ position: 'relative' }}>
        <MapContainer
          key={mapKey}
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={15}
          style={{ height: '300px', width: '100%', zIndex: 0 }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterController center={selectedLocation || mapCenter} shouldRecenter={shouldRecenter} />
          <MapClickHandler onLocationChange={handleLocationChange} />
          {selectedLocation && (
            <DraggableMarker
              position={selectedLocation}
              onPositionChange={handleLocationChange}
            />
          )}
        </MapContainer>
        {onResetToCurrent && (
          <button
            type="button"
            className="reset-location-button map-overlay-button"
            onClick={handleReset}
            title="Reset to my current location"
          >
            Use My Location
          </button>
        )}
      </div>
      <div className="location-coordinates">
        <small>
          Drag the marker or click on the map to select location
        </small>
        {selectedLocation && (
          <small className="coordinates-text">
            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </small>
        )}
      </div>
    </div>
  )
}

export default LocationPicker
