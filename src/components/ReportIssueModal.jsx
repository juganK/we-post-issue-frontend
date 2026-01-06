import { useState, useEffect } from 'react'
import axios from 'axios'
import ImageUpload from './ImageUpload'
import LocationPicker from './LocationPicker'

const ISSUE_TYPES = [
  { value: 'POTHOLE', label: 'Pothole' },
  { value: 'STREET_LIGHT_NOT_WORKING', label: 'Street Light Not Working' },
  { value: 'GARBAGE_DUMP', label: 'Garbage Dump' },
  { value: 'WATER_LEAKAGE', label: 'Water Leakage' },
  { value: 'SEWAGE_OVERFLOW', label: 'Sewage Overflow' },
  { value: 'OTHER', label: 'Other' }
]

function ReportIssueModal({ userLocation, onClose, onSuccess }) {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  
  // Check for placeholder values and log warning
  useEffect(() => {
    if (API_BASE_URL && (
      API_BASE_URL.includes('your-backend') || 
      API_BASE_URL.includes('example.com') ||
      (import.meta.env.PROD && API_BASE_URL.includes('localhost'))
    )) {
      console.warn('⚠️ VITE_API_BASE_URL appears to be set to a placeholder value. Please update it with your actual backend URL in Vercel project settings.')
    }
  }, [API_BASE_URL])
  
  const [selectedLocation, setSelectedLocation] = useState(userLocation)
  const [formData, setFormData] = useState({
    description: '',
    issueType: 'POTHOLE',
    village: '',
    image: null
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setSelectedLocation(userLocation)
  }, [userLocation])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' })
    }
  }

  const handleFileChange = (file) => {
    setFormData({ ...formData, image: file })
    if (validationErrors.image) {
      setValidationErrors({ ...validationErrors, image: '' })
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters'
    }
    
    if (!formData.village.trim()) {
      errors.village = 'Village/City is required'
    }
    
    if (!formData.image) {
      errors.image = 'Please upload an image'
    } else {
      const maxSize = 5 * 1024 * 1024
      if (formData.image.size > maxSize) {
        errors.image = 'Image size must be less than 5MB'
      }
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(formData.image.type)) {
        errors.image = 'Please upload a valid image (JPEG, PNG, or WebP)'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setError(null)

    const data = new FormData()
    data.append('issueType', formData.issueType)
    data.append('description', formData.description)
    data.append('latitude', selectedLocation.lat.toString())
    data.append('longitude', selectedLocation.lng.toString())
    data.append('village', formData.village)
    data.append('image', formData.image)

    try {
      const endpoint = API_BASE_URL ? `${API_BASE_URL}/save/issue` : '/save/issue'
      const response = await axios.post(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (response.status === 201) {
        onSuccess()
      }
    } catch (err) {
      console.error('Submission error:', err)
      console.error('Error response:', err.response)
      console.error('Error data:', err.response?.data)
      
      let errorMessage = 'Failed to report issue. Please try again.'
      
      if (err.response) {
        // Server responded with error
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error
          }
        } else {
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`
        }
      } else if (err.request) {
        // Request was made but no response received
        const isProduction = import.meta.env.PROD
        const isPlaceholder = API_BASE_URL && (
          API_BASE_URL.includes('your-backend') || 
          API_BASE_URL.includes('example.com') ||
          (isProduction && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')))
        )
        
        if (isProduction && (!API_BASE_URL || isPlaceholder)) {
          if (isPlaceholder) {
            errorMessage = 'Backend API URL is set to a placeholder value. Please update VITE_API_BASE_URL in Vercel project settings with your actual backend URL (e.g., https://your-backend.vercel.app). Do NOT include :8080 in production URLs.'
          } else {
            errorMessage = 'Backend API is not configured. Please set VITE_API_BASE_URL environment variable in Vercel project settings.'
          }
        } else if (isProduction) {
          errorMessage = `Cannot connect to backend API at ${API_BASE_URL}. Please check if the backend is running and accessible.`
        } else {
          errorMessage = 'No response from server. Please check if the backend is running on port 8080.'
        }
      } else {
        // Error in setting up the request
        errorMessage = `Request error: ${err.message}`
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="report-modal">
        <div className="modal-header">
          <h2>Report Issue</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="issueType">
              Issue Type <span className="required">*</span>
            </label>
            <select
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleInputChange}
              required
            >
              {ISSUE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe the issue in detail..."
              maxLength={500}
              required
            />
            {validationErrors.description && (
              <span className="field-error" role="alert">
                {validationErrors.description}
              </span>
            )}
            <small className="hint">
              {formData.description.length}/500 characters
            </small>
          </div>

          <div className="form-group">
            <LocationPicker
              initialLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              onResetToCurrent={() => setSelectedLocation(userLocation)}
            />
            <small className="hint">
              Drag the marker or click on the map to select the exact location of the issue
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="village">
              Village / Local City <span className="required">*</span>
            </label>
            <input
              type="text"
              id="village"
              name="village"
              value={formData.village}
              onChange={handleInputChange}
              placeholder="Enter village or city name"
              required
            />
            {validationErrors.village && (
              <span className="field-error" role="alert">
                {validationErrors.village}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>
              Image <span className="required">*</span>
            </label>
            <ImageUpload
              onFileChange={handleFileChange}
              error={validationErrors.image}
            />
            {validationErrors.image && (
              <span className="field-error" role="alert">
                {validationErrors.image}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default ReportIssueModal
