import { useEffect } from 'react'

function IssueDetailsSheet({ issue, onClose }) {
  useEffect(() => {
    // Prevent body scroll when sheet is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const formatIssueType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose}></div>
      <div className="issue-details-sheet">
        <div className="sheet-drag-handle"></div>
        <div className="sheet-header">
          <h2>Issue Details</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="sheet-content">
          <div className="issue-type-badge">
            {formatIssueType(issue.issueType)}
          </div>
          <div className="issue-description">
            <h3>Description</h3>
            <p>{issue.description}</p>
          </div>
          {issue.imgUrl && (
            <div className="issue-image">
              <h3>Image</h3>
              <img src={issue.imgUrl} alt="Issue" />
            </div>
          )}
          {issue.localCity && (
            <div className="issue-location">
              <h3>Location</h3>
              <p>{issue.localCity}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default IssueDetailsSheet
