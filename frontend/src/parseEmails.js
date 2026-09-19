const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi

export function parseCsvRows(text) {
  const rows = []
  let currentRow = []
  let currentValue = ''
  let inQuotes = false

  const pushRow = () => {
    currentRow.push(currentValue)
    if (currentRow.some((cell) => cell.trim() !== '')) {
      rows.push(currentRow)
    }
    currentRow = []
    currentValue = ''
  }

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
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentValue)
      currentValue = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1
      }
      pushRow()
    } else {
      currentValue += char
    }
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    pushRow()
  }

  return rows
}

// Scans every cell of the CSV, so it works no matter where the header sits
// (rosters often have title rows above it) and regardless of column name.
export function getEmailsFromCsv(text) {
  const rows = parseCsvRows(text.replace(/^﻿/, ''))

  if (!rows.length) {
    throw new Error('The CSV appears to be empty.')
  }

  const seen = new Set()
  const emails = []

  for (const row of rows) {
    for (const cell of row) {
      for (const match of cell.match(EMAIL_PATTERN) ?? []) {
        const key = match.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          emails.push(match)
        }
      }
    }
  }

  if (!emails.length) {
    throw new Error('No email addresses were found in this CSV.')
  }

  return emails
}
