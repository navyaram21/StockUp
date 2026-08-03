export default function HITLPanel({ action, onApprove, onReject, loading }) {
  return (
    <div className="mx-4 mb-4 bg-amber-950/40 border border-amber-700/60 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mt-0.5">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-amber-300 font-semibold text-sm mb-1">Agent requires approval</p>
          <p className="text-amber-200/70 text-xs mb-3">
            The agent wants to run <span className="font-mono bg-amber-900/40 px-1.5 py-0.5 rounded text-amber-300">{action?.tool || 'unknown'}</span>
          </p>
          {action?.args && Object.keys(action.args).length > 0 && (
            <div className="bg-gray-900/60 rounded-lg p-3 mb-3 overflow-x-auto">
              <p className="text-gray-400 text-xs font-medium mb-1.5">Arguments</p>
              <pre className="text-gray-200 text-xs font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(action.args, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-2 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              disabled={loading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg py-2 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
