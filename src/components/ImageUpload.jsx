import { useState, useEffect } from 'react'

export default function ImageUpload({ onFileChange, error }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile)
      onFileChange(selectedFile)
    } else {
      alert('Please select a valid image file')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div
      className={`dropzone ${dragOver ? 'dragover' : ''} ${error ? 'error' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Image upload area"
    >
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
        style={{ display: 'none' }}
        aria-label="Upload image"
      />
      <label htmlFor="fileInput" className="dropzone-label">
        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="preview-image" />
            <div className="preview-info">
              <span className="preview-name">{file?.name}</span>
              <span className="preview-size">
                {(file?.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        ) : (
          <div className="dropzone-content">
            <p className="dropzone-text">
              Drag and drop an image here, or click to browse
            </p>
            <p className="dropzone-hint">Supports: JPEG, PNG, WebP (Max 5MB)</p>
          </div>
        )}
      </label>
    </div>
  )
}
