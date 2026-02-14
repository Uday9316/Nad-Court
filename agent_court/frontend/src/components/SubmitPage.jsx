import { useState } from 'react'
import './AppCleanMinimal.css'

function SubmitPage() {
  const [formData, setFormData] = useState({
    caseType: '',
    plaintiff: '',
    defendant: '',
    summary: '',
    plaintiffArgument: '',
    defendantArgument: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Submitting case:', formData)
  }

  return (
    <div className="main">
      <div className="submit-page">
        <div className="page-header">
          <h1>Submit a Case</h1>
          <p>File a dispute for the community to review and judge.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Case Type</label>
            <select 
              className="form-select"
              value={formData.caseType}
              onChange={(e) => setFormData({...formData, caseType: e.target.value})}
            >
              <option value="">Select case type</option>
              <option value="beef">Beef Resolution</option>
              <option value="conflict">Community Conflict</option>
              <option value="role">Role Assignment</option>
              <option value="art">Art Ownership</option>
              <option value="purge">Ban Appeal</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Plaintiff</label>
              <input 
                type="text"
                className="form-input"
                placeholder="@username"
                value={formData.plaintiff}
                onChange={(e) => setFormData({...formData, plaintiff: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Defendant</label>
              <input 
                type="text"
                className="form-input"
                placeholder="@username"
                value={formData.defendant}
                onChange={(e) => setFormData({...formData, defendant: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Case Summary</label>
            <textarea 
              className="form-textarea"
              placeholder="Describe the dispute in detail..."
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
            />
            <p className="form-hint">Provide enough context for judges to understand the situation.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Plaintiff's Argument</label>
            <textarea 
              className="form-textarea"
              placeholder="Why should the plaintiff win?"
              value={formData.plaintiffArgument}
              onChange={(e) => setFormData({...formData, plaintiffArgument: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Defendant's Argument</label>
            <textarea 
              className="form-textarea"
              placeholder="Why should the defendant win?"
              value={formData.defendantArgument}
              onChange={(e) => setFormData({...formData, defendantArgument: e.target.value})}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Case</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitPage