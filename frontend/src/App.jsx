import { useMemo, useRef, useState } from 'react'
import './App.css'

function parseCsvRows(text) {
  const rows = []
  let currentRow = []
  let currentValue = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentValue)
      currentValue = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1
      }

      currentRow.push(currentValue)
      if (currentRow.some((cell) => cell !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      currentValue = ''
      continue
    }

    currentValue += char
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue)
    if (currentRow.some((cell) => cell !== '')) {
      rows.push(currentRow)
    }
  }

  return rows
}

function getEmailsFromCsv(text) {
  const rows = parseCsvRows(text)

  if (!rows.length) {
    throw new Error('The CSV appears to be empty.')
  }

  const header = rows[0].map((cell) => cell.trim())
  const emailIndex = header.findIndex((cell) => cell === 'Campus Email')

  if (emailIndex === -1) {
    throw new Error('No "Campus Email" column was found in this CSV.')
  }

  const emails = []

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i]
    const value = (row[emailIndex] ?? '').trim()

    if (!value || value === '(Hidden)') {
      continue
    }

    if (!emails.includes(value)) {
      emails.push(value)
    }
  }

  if (!emails.length) {
    throw new Error('No valid email addresses were found in the selected CSV.')
  }

  return emails
}

function App() {
  const [emails, setEmails] = useState([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const emailList = useMemo(() => emails.join(', '), [emails])

  const handleFile = (file) => {
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = String(event.target?.result ?? '')
        const extractedEmails = getEmailsFromCsv(text)
        setEmails(extractedEmails)
        setFileName(file.name)
        setError('')
      } catch (readError) {
        setError(readError.message)
        setEmails([])
      }
    }

    reader.onerror = () => {
      setError('There was a problem reading the file.')
      setEmails([])
    }

    reader.readAsText(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const [file] = event.dataTransfer.files
    handleFile(file)
  }

  const handleInputChange = (event) => {
    const [file] = event.target.files
    handleFile(file)
    event.target.value = ''
  }

  const copyEmails = async () => {
    if (!emails.length) {
      return
    }

    try {
      await navigator.clipboard.writeText(emailList)
    } catch {
      // no-op: clipboard availability can vary by browser
    }
  }

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">CSV email extractor</p>
        <h1>Drop your roster and get the emails</h1>
        <p className="subtitle">
          Upload a CSV file and the app will pull out every address in the
          <strong> Campus Email</strong> column.
        </p>

        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleInputChange}
            hidden
          />

          <div className="drop-icon">⇪</div>
          <p className="drop-title">Drag & drop a CSV here</p>
          <p className="drop-subtitle">or click to browse</p>
          {fileName ? <span className="file-badge">{fileName}</span> : null}
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        <div className="results-box">
          <div className="results-header">
            <h2>Extracted emails</h2>
            {emails.length ? (
              <button type="button" onClick={copyEmails} className="copy-button">
                Copy
              </button>
            ) : null}
          </div>

          {emails.length ? (
            <>
              <div className="email-list">
                {emails.map((email) => (
                  <span key={email} className="email-pill">
                    {email}
                  </span>
                ))}
              </div>

              <textarea readOnly value={emailList} className="email-output" />
            </>
          ) : (
            <p className="empty-state">No emails extracted yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
