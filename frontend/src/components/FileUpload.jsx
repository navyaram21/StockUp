import { useRef, useState } from 'react'

const API = 'http://localhost:8000'

export default function FileUpload({ threadId, onUploadComplete }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setStatus(null)

    const form = new FormData()
    form.append('file', file)
    form.append('thread_id', threadId)

    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      setStatus('success')
      onUploadComplete?.(`Bank statement "${file.name}" uploaded successfully.`)
    } catch {
      setStatus('error')
    } finally {
      setUploading(false)
      inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current.click()}
        disabled={uploading}
        title="Upload bank statement CSV"
        className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-200 text-sm rounded-lg transition-colors"
      >
        {uploading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
          </svg>
        )}
        <span className="hidden sm:inline">Upload CSV</span>
      </button>

      {status === 'success' && (
        <span className="text-emerald-400 text-xs">Uploaded</span>
      )}
      {status === 'error' && (
        <span className="text-red-400 text-xs">Failed</span>
      )}
    </div>
  )
}
