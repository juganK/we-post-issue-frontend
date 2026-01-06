import { useState, useEffect } from 'react'
import ImageUpload from './ImageUpload'

const ISSUE_TYPES = [
  { value: 'POTHOLE', label: 'Pothole' },
  { value: 'STREET_LIGHT_NOT_WORKING', label: 'Street Light Not Working' },
  { value: 'GARBAGE_DUMP', label: 'Garbage Dump' },
  { value: 'WATER_LEAKAGE', label: 'Water Leakage' },
  { value: 'SEWAGE_OVERFLOW', label: 'Sewage Overflow' },
  { value: 'OTHER', label: 'Other' }
]

export default function IssueForm({ position, onSubmit, isLoading, error, message }) {
  const [formData, setFormData] = useState({
    description: '',
    issueType: 'POTHOLE',
    village: '',
    image: null
  })
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (message) {
      // Reset form on success
      setFormData({
        description: '',
        issueType: 'POTHOLE',
        village: '',
        image: null
      })
      setValidationErrors({})
    }
  }, [message])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Clear validation error for this field
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
    
    if (!position) {
      errors.position = 'Please select a location on the map'
    }
    
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
      const maxSize = 5 * 1024 * 1024 // 5MB
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Issue Details</h2>
      </div>
      <div className="card-body">
        {message && (
          <div className="success-message" role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
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
              aria-required="true"
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
              aria-required="true"
              aria-invalid={!!validationErrors.description}
              aria-describedby={validationErrors.description ? 'description-error' : undefined}
            />
            {validationErrors.description && (
              <span id="description-error" className="field-error" role="alert">
                {validationErrors.description}
              </span>
            )}
            <small className={`hint ${formData.description.length > 450 ? 'hint-warning' : ''}`}>
              {formData.description.length}/500 characters
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
              aria-required="true"
              aria-invalid={!!validationErrors.village}
              aria-describedby={validationErrors.village ? 'village-error' : undefined}
            />
            {validationErrors.village && (
              <span id="village-error" className="field-error" role="alert">
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
            {validationErrors.position && (
              <span className="field-error" role="alert">
                {validationErrors.position}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
