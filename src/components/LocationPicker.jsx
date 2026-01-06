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

function MapCenterController({ center }) {
  const map = useMap()
  
  useEffect(() => {
    if (center && map) {
      // Use invalidateSize to ensure map renders properly when container becomes visible
      setTimeout(() => {
        map.invalidateSize()
        map.setView([center.lat, center.lng], 15)
      }, 100)
    }
  }, [center, map])
  
  return null
}

function DraggableMarker({ position, onPositionChange }) {
  const [draggedPosition, setDraggedPosition] = useState(position)

  useEffect(() => {
    setDraggedPosition(position)
  }, [position])

  useMapEvents({
    click(e) {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng }
      setDraggedPosition(newPosition)
      onPositionChange(newPosition)
    }
  })

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

function LocationPicker({ initialLocation, onLocationChange, onResetToCurrent }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [mapKey, setMapKey] = useState(0)

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation)
    }
  }, [initialLocation])

  const handleLocationChange = (location) => {
    setSelectedLocation(location)
    onLocationChange(location)
  }

  const handleReset = () => {
    if (onResetToCurrent && initialLocation) {
      setSelectedLocation(initialLocation)
      onLocationChange(initialLocation)
      setMapKey(prev => prev + 1) // Force map re-render
    }
  }

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <label>Select Issue Location</label>
        {onResetToCurrent && (
          <button
            type="button"
            className="reset-location-button"
            onClick={handleReset}
            title="Reset to my current location"
          >
            Use My Location
          </button>
        )}
      </div>
      {selectedLocation && (
        <MapContainer
          key={mapKey}
          center={[selectedLocation.lat, selectedLocation.lng]}
          zoom={15}
          style={{ height: '300px', width: '100%', zIndex: 0 }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterController center={selectedLocation} />
          <DraggableMarker
            position={selectedLocation}
            onPositionChange={handleLocationChange}
          />
        </MapContainer>
      )}
      <div className="location-coordinates">
        <small>
          Drag the marker or click on the map to select location
        </small>
        <small className="coordinates-text">
          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </small>
      </div>
    </div>
  )
}

export default LocationPicker
