import { useState } from 'react'

const API = 'http://localhost:8000'

export default function LoginScreen({ onConnect }) {
  const [alpacaKey, setAlpacaKey] = useState('')
  const [alpacaSecret, setAlpacaSecret] = useState('')
  const [alphaVantageKey, setAlphaVantageKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  async function handleConnect(e) {
    e.preventDefault()
    if (!alpacaKey || !alpacaSecret || !alphaVantageKey) return

    setConnecting(true)
    setError(null)

    try {
      const res = await fetch(`${API}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alpaca_api_key: alpacaKey,
          alpaca_secret_key: alpacaSecret,
          alpha_vantage_api_key: alphaVantageKey,
        }),
      })
      if (!res.ok) throw new Error('Connect failed')
      const data = await res.json()
      onConnect(data.thread_id)
    } catch {
      setError('Failed to connect. Please check your API keys and try again.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">FinPilot</h1>
          <p className="text-gray-400 mt-1 text-sm">Connect your trading and market data APIs</p>
        </div>

        <form
          onSubmit={handleConnect}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Alpaca API Key
            </label>
            <input
              type="password"
              value={alpacaKey}
              onChange={e => setAlpacaKey(e.target.value)}
              placeholder="PKXXXXXXXXXXXXXXXX"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Alpaca Secret Key
            </label>
            <input
              type="password"
              value={alpacaSecret}
              onChange={e => setAlpacaSecret(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Alpha Vantage API Key
            </label>
            <input
              type="password"
              value={alphaVantageKey}
              onChange={e => setAlphaVantageKey(e.target.value)}
              placeholder="XXXXXXXXXXXXXXXX"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3.5 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!alpacaKey || !alpacaSecret || !alphaVantageKey || connecting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
          >
            {connecting ? 'Connecting…' : 'Connect'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Your keys are stored only in your browser session
        </p>
      </div>
    </div>
  )
}
