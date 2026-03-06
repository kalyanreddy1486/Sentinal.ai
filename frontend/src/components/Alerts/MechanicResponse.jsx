import { useState } from 'react';
import { API_BASE_URL } from '../../config';

export default function MechanicResponse({ alert, onResponse }) {
  const [loading, setLoading] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [showEtaInput, setShowEtaInput] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  const handleAccept = async () => {
    if (!showEtaInput) {
      setShowEtaInput(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alert.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: 'accepted',
          eta_minutes: etaMinutes,
          notes: responseNotes
        })
      });
      
      if (response.ok) {
        onResponse?.('accepted', etaMinutes, responseNotes);
      }
    } catch (error) {
      console.error('Failed to accept alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alert.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: 'rejected',
          notes: responseNotes
        })
      });
      
      if (response.ok) {
        onResponse?.('rejected', null, responseNotes);
      }
    } catch (error) {
      console.error('Failed to reject alert:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if already responded
  if (alert.status !== 'open') {
    return (
      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            alert.status === 'acknowledged' ? 'bg-emerald-400' : 'bg-rose-400'
          }`} />
          <span className="text-sm text-slate-300">
            {alert.status === 'acknowledged' 
              ? `Accepted - ETA: ${alert.eta_minutes} min` 
              : 'Rejected'}
          </span>
        </div>
        {alert.response_notes && (
          <p className="mt-2 text-xs text-slate-400">{alert.response_notes}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* ETA Input */}
      {showEtaInput && (
        <div className="p-3 bg-slate-700/50 rounded-lg space-y-3">
          <div>
            <label className="text-xs text-slate-400">Estimated Arrival Time (minutes)</label>
            <div className="flex gap-2 mt-1">
              {[5, 10, 15, 30, 60].map((min) => (
                <button
                  key={min}
                  onClick={() => setEtaMinutes(min)}
                  className={`px-3 py-1 text-xs rounded ${
                    etaMinutes === min
                      ? 'bg-cyan-500 text-slate-900'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-slate-400">Notes (optional)</label>
            <textarea
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              placeholder="Any additional information..."
              className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : showEtaInput ? 'Confirm Acceptance' : 'Accept'}
        </button>
        
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-lg hover:bg-rose-500/30 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Reject'}
        </button>
      </div>
    </div>
  );
}
