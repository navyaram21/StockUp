import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import LoginScreen from './components/LoginScreen'
import ChatMessage from './components/ChatMessage'
import HITLPanel from './components/HITLPanel'
import FileUpload from './components/FileUpload'

const API = 'http://localhost:8000'

export default function App() {
  const [threadId, setThreadId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingAction])

  function addMessage(role, content) {
    setMessages(prev => [...prev, { id: uuidv4(), role, content }])
  }

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    addMessage('user', text)
    setLoading(true)
    setPendingAction(null)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, thread_id: threadId }),
      })
      const data = await res.json()

      if (data.status === 'pending') {
        setPendingAction(data.action)
      } else {
        addMessage('agent', data.response)
      }
    } catch {
      addMessage('agent', 'Sorry, something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId }),
      })
      const data = await res.json()
      setPendingAction(null)
      addMessage('agent', data.response)
    } catch {
      addMessage('agent', 'Approval failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId }),
      })
      const data = await res.json()
      setPendingAction(null)
      addMessage('agent', data.response)
    } catch {
      addMessage('agent', 'Rejection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!threadId) {
    return <LoginScreen onConnect={setThreadId} />
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-white font-semibold">FinPilot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs font-mono hidden sm:block">
            thread: {threadId.slice(0, 8)}…
          </span>
          <button
            onClick={() => setThreadId(null)}
            className="text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">Ask me anything about your portfolio</p>
            <p className="text-gray-600 text-sm mt-1">Try: "What stocks should I buy?" or "Analyze my spending"</p>
          </div>
        )}

        {messages.map(msg => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {loading && !pendingAction && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-200 flex-shrink-0">
              AI
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* HITL Panel */}
      {pendingAction && (
        <HITLPanel
          action={pendingAction}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
        />
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-gray-800 px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <FileUpload
            threadId={threadId}
            onUploadComplete={msg => addMessage('agent', msg)}
          />
          <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl flex items-end gap-2 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
              placeholder="Ask about your portfolio, market data, or budget…"
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none focus:outline-none max-h-32 overflow-y-auto"
              style={{ height: 'auto' }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        <p className="text-gray-600 text-xs mt-1.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
