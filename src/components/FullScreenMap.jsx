import { useEffect, useRef } from 'react'
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
  const animationTimer = useRef(null)
  const isAnimating = useRef(false)
  
  useEffect(() => {
    // Only run if we have a center
    if (center) {
      // Stop any existing animation first to prevent stacking
      if (isAnimating.current) {
        map.stop()
      }
      
      // Clear any existing timer
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
        animationTimer.current = null
      }

      if (animate) {
        // Set animation flag
        isAnimating.current = true
        
        // Ensure map size is valid before animating
        map.invalidateSize()
        
        // Perform the smooth zoom-in animation for exactly 3 seconds
        map.flyTo(center, zoom, {
          duration: 3.0,
          easeLinearity: 0.25
        })
        
        // Call completion callback after exactly 3 seconds
        animationTimer.current = setTimeout(() => {
          isAnimating.current = false
          if (onAnimationComplete) {
            onAnimationComplete()
          }
        }, 3000)
      } else {
        // Instant move without animation and keeping current zoom
        map.setView(center, map.getZoom(), {
          animate: false
        })
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }
    }
    
    // Cleanup function
    return () => {
      // Stop any ongoing animation
      if (isAnimating.current) {
        map.stop()
        isAnimating.current = false
      }
      // Clear timer
      if (animationTimer.current) {
        clearTimeout(animationTimer.current)
        animationTimer.current = null
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
        {mapCenter && (
          <MapController 
            key={`${mapCenter.lat}-${mapCenter.lng}-${mapCenter._timestamp || 0}`}
            center={[mapCenter.lat, mapCenter.lng]} 
            zoom={18}
            animate={false}
            onAnimationComplete={onAnimationComplete}
          />
        )}
        
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
      
      <div className="map-controls">
        <button 
          className="report-issue-button"
          onClick={onReportClick}
          aria-label="Report Issue"
        >
          Report Issue
        </button>
      </div>
    </div>
  )
}

export default FullScreenMap
