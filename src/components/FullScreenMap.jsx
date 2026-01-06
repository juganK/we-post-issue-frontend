import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

// User location icon (blue)
const UserLocationIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'user-location-marker'
})

function MapController({ center, zoom, animate = false, onAnimationComplete }) {
  const map = useMap()
  
  useEffect(() => {
    if (center) {
      // Ensure map size is valid before animating
      map.invalidateSize()
      
      if (animate) {
        map.flyTo(center, zoom, {
          duration: 1.5,
          easeLinearity: 0.25
        })
        // Reset animation flag after animation completes
        const timer = setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete()
          }
        }, 1500)
        return () => clearTimeout(timer)
      } else {
        map.setView(center, zoom)
      }
    }
  }, [center, zoom, map, animate, onAnimationComplete])
  
  return null
}

function FullScreenMap({ userLocation, mapCenter, issues, onMarkerClick, onReportClick, onCenterLocation, onAnimationComplete }) {
  const getIssueTypeColor = (issueType) => {
    const colors = {
      POTHOLE: '#ff6b6b',
      STREET_LIGHT_NOT_WORKING: '#ffd93d',
      GARBAGE_DUMP: '#6bcf7f',
      WATER_LEAKAGE: '#4d96ff',
      SEWAGE_OVERFLOW: '#9b59b6',
      OTHER: '#95a5a6'
    }
    return colors[issueType] || '#95a5a6'
  }

  const createBlinkingRedIcon = () => {
    return L.divIcon({
      className: 'issue-blink-container',
      html: `<div class="issue-blink-dot"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })
  }

  return (
    <div className="fullscreen-map-container">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController 
          center={mapCenter ? [mapCenter.lat, mapCenter.lng] : [userLocation.lat, userLocation.lng]} 
          zoom={mapCenter ? 18 : 13}
          animate={!!mapCenter}
          onAnimationComplete={onAnimationComplete}
        />
        
        {/* User Location Marker */}
        <Marker
          key={`user-${userLocation.lat}-${userLocation.lng}`}
          position={[userLocation.lat, userLocation.lng]}
          icon={UserLocationIcon}
        >
          <Popup>
            <div className="marker-popup">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>
        <Circle
          key={`circle-${userLocation.lat}-${userLocation.lng}`}
          center={[userLocation.lat, userLocation.lng]}
          radius={100}
          pathOptions={{
            color: '#0066ff',
            fillColor: '#0066ff',
            fillOpacity: 0.2,
            weight: 2
          }}
        />
        
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={createBlinkingRedIcon()}
            eventHandlers={{
              click: () => onMarkerClick(issue)
            }}
          >
            <Popup>
              <div className="marker-popup">
                <strong>{issue.issueType.replace(/_/g, ' ')}</strong>
                <p>{issue.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <button 
        className="report-issue-button"
        onClick={onReportClick}
        aria-label="Report Issue"
      >
        Report Issue
      </button>
      
      <button 
        className="my-location-button"
        onClick={onCenterLocation}
        aria-label="Center on my location"
        title="Center on my location"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  )
}

export default FullScreenMap
