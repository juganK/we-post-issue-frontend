import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/Header'
import FullScreenMap from './components/FullScreenMap'
import IssueDetailsSheet from './components/IssueDetailsSheet'
import ReportIssueModal from './components/ReportIssueModal'

function App() {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const [userLocation, setUserLocation] = useState(null)
  const [issues, setIssues] = useState([])
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState(null)

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter(location)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Default to India center if location denied
          const defaultLocation = { lat: 20.5937, lng: 78.9629 }
          setUserLocation(defaultLocation)
          setMapCenter(defaultLocation)
        }
      )

      // Watch position for movement tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
        },
        (error) => {
          console.error('Error watching location:', error)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      )

      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    } else {
      const defaultLocation = { lat: 20.5937, lng: 78.9629 }
      setUserLocation(defaultLocation)
      setMapCenter(defaultLocation)
    }
  }, [])

  // Fetch all issues
  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/issues` : '/issues'
      const response = await axios.get(endpoint)
      setIssues(response.data)
    } catch (error) {
      console.error('Error fetching issues:', error)
      // Log helpful message in production if API_BASE_URL is missing
      if (import.meta.env.PROD && !API_BASE_URL) {
        console.error('VITE_API_BASE_URL environment variable is not set. Please configure it in Vercel project settings.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleIssueReported = () => {
    setShowReportModal(false)
    fetchIssues() // Refresh issues after reporting
  }

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue)
  }

  const handleCloseDetails = () => {
    setSelectedIssue(null)
  }

  const handleCenterOnLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation)
    } else {
      // Try to get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            setUserLocation(location)
            setMapCenter(location)
          },
          (error) => {
            console.error('Error getting location:', error)
            alert('Unable to get your location. Please enable location services.')
          }
        )
      }
    }
  }

  const handleAnimationComplete = () => {
    setMapCenter(null)
  }

  if (loading || !userLocation) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Header />
      <FullScreenMap
        userLocation={userLocation}
        mapCenter={mapCenter}
        issues={issues}
        onMarkerClick={handleMarkerClick}
        onReportClick={() => setShowReportModal(true)}
        onCenterLocation={handleCenterOnLocation}
        onAnimationComplete={handleAnimationComplete}
      />
      {selectedIssue && (
        <IssueDetailsSheet
          issue={selectedIssue}
          onClose={handleCloseDetails}
        />
      )}
      {showReportModal && (
        <ReportIssueModal
          userLocation={userLocation}
          onClose={() => setShowReportModal(false)}
          onSuccess={handleIssueReported}
        />
      )}
    </div>
  )
}

export default App
