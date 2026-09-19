import { useMemo, useRef, useState } from 'react'
import bunny from './assets/bunny.png'
import { getEmailsFromCsv } from './parseEmails.js'
import './App.css'

function App() {
  const [emails, setEmails] = useState([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const emailList = useMemo(() => emails.join(','), [emails])

  const handleFile = (file) => {
    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a .csv file.')
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = String(event.target?.result ?? '')
        setEmails(getEmailsFromCsv(text))
        setFileName(file.name)
        setError('')
        setCopied(false)
      } catch (readError) {
        setError(readError.message)
        setEmails([])
        setFileName('')
      }
    }

    reader.onerror = () => {
      setError('There was a problem reading the file.')
      setEmails([])
      setFileName('')
    }

    reader.readAsText(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  const handleInputChange = (event) => {
    handleFile(event.target.files[0])
    event.target.value = ''
  }

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(emailList)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard availability varies by browser; the text stays selectable
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Email extractor</p>
          <h1>
            Roster in.
            <br />
            Emails out.
          </h1>
          <p className="subtitle">
            Drop any CSV and get every email address back as one
            comma-separated list, campus or not.
          </p>
        </div>
        <img className="hero-art" src={bunny} alt="A bunny typing on a laptop" />
      </header>

      <section className="panel">
        <div
          className={`drop-zone${isDragging ? ' dragging' : ''}`}
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
          <p className="drop-title">
            {fileName ? fileName : 'Drop a CSV here'}
          </p>
          <p className="drop-subtitle">
            {fileName ? 'Click or drop to use a different file' : 'or click to browse'}
          </p>
        </div>

        {error ? (
          <div className="error-box" role="alert">
            {error}
          </div>
        ) : null}

        {emails.length ? (
          <div className="results">
            <div className="results-header">
              <div>
                <h2>Your list</h2>
                <p className="count">
                  {emails.length} unique {emails.length === 1 ? 'email' : 'emails'}
                </p>
              </div>
              <button type="button" onClick={copyEmails} className="copy-button">
                {copied ? 'Copied' : 'Copy list'}
              </button>
            </div>

            <textarea
              readOnly
              value={emailList}
              className="email-output"
              onFocus={(event) => event.target.select()}
              aria-label="Comma-separated email list"
            />
          </div>
        ) : null}
      </section>

      <footer className="footnote">Runs entirely in your browser. Nothing is uploaded.</footer>
    </main>
  )
}

export default App
