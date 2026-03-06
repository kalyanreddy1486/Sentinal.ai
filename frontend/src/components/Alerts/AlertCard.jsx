import { useState, useEffect } from 'react';
import MechanicResponse from './MechanicResponse';

export default function AlertCard({ alert, onAcknowledge, onResolve, onMechanicResponse }) {
  const [timeAgo, setTimeAgo] = useState('');
  const [escalationTime, setEscalationTime] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [notes, setNotes] = useState('');
  const [actualFailure, setActualFailure] = useState('');
  const [geminiCorrect, setGeminiCorrect] = useState(true);

  // Calculate time ago
  useEffect(() => {
    const updateTime = () => {
      const created = new Date(alert.created_at);
      const now = new Date();
      const diff = Math.floor((now - created) / 1000);
      
      if (diff < 60) setTimeAgo(`${diff}s ago`);
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      else if (diff < 86400) setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      else setTimeAgo(`${Math.floor(diff / 86400)}d ago`);
      
      // Calculate escalation time (15 min intervals)
      const escalationLevel = alert.escalation_level || 0;
      const nextEscalation = (escalationLevel + 1) * 15;
      const elapsed = Math.floor(diff / 60);
      const remaining = nextEscalation - elapsed;
      
      if (remaining > 0) {
        setEscalationTime(`${remaining}m to escalation`);
      } else {
        setEscalationTime('Escalated');
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [alert]);

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      case 'WARNING': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'EMERGENCY': return 'bg-red-600/20 text-red-400 border-red-600/50';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-rose-500 animate-pulse';
      case 'acknowledged': return 'bg-amber-500';
      case 'resolved': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAcknowledge = () => {
    onAcknowledge?.(alert.alert_id);
  };

  const handleResolve = () => {
    onResolve?.(alert.alert_id, resolution, notes, geminiCorrect, actualFailure);
    setShowResolveModal(false);
    setResolution('');
    setNotes('');
    setActualFailure('');
  };

  const sensors = alert.sensor_snapshot || {};

  return (
    <>
      <div className={`bg-slate-800/50 border rounded-xl p-5 transition-all hover:bg-slate-800/70 ${
        alert.severity === 'CRITICAL' ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' : 
        alert.severity === 'WARNING' ? 'border-amber-500/30' : 'border-slate-700'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(alert.status)}`}></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{alert.alert_id}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-0.5">
                Machine: <span className="text-cyan-400">{alert.machine_id}</span> • {timeAgo}
              </div>
            </div>
          </div>
          
          {alert.status === 'open' && (
            <div className="text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded">
              ⏱️ {escalationTime}
            </div>
          )}
        </div>

        {/* Diagnosis Info */}
        <div className="mb-4">
          <div className="text-white font-medium mb-1">{alert.failure_type}</div>
          <div className="text-sm text-gray-400 mb-2">
            Confidence: <span className="text-cyan-400">{alert.confidence}%</span> • 
            Time to breach: <span className="text-amber-400">{alert.time_to_breach}</span>
          </div>
          <div className="text-sm text-gray-300 bg-slate-900/50 p-3 rounded-lg">
            <span className="text-gray-500">Recommended Action:</span> {alert.recommended_action}
          </div>
        </div>

        {/* Sensor Snapshot */}
        {Object.keys(sensors).length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(sensors).map(([key, value]) => (
              <div key={key} className="bg-slate-900/50 rounded p-2">
                <div className="text-xs text-gray-500 capitalize">{key}</div>
                <div className="text-sm font-mono text-white">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mechanic Response Section */}
        <MechanicResponse 
          alert={alert} 
          onResponse={(type, eta, notes) => onMechanicResponse?.(alert.alert_id, type, eta, notes)}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            {alert.status === 'open' && (
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors"
              >
                👋 Acknowledge
              </button>
            )}
            {(alert.status === 'open' || alert.status === 'acknowledged') && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors"
              >
                ✅ Resolve
              </button>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {alert.escalation_level > 0 && (
              <span className="text-rose-400">⚠️ Escalated {alert.escalation_level}x</span>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Resolve Alert</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select resolution...</option>
                  <option value="fixed">Fixed - Issue resolved</option>
                  <option value="false_alarm">False Alarm - No issue found</option>
                  <option value="monitoring">Monitoring - Under observation</option>
                  <option value="maintenance_scheduled">Maintenance Scheduled</option>
                  <option value="replaced">Component Replaced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Actual Failure (for Gemini accuracy tracking)
                </label>
                <input
                  type="text"
                  value={actualFailure}
                  onChange={(e) => setActualFailure(e.target.value)}
                  placeholder="What was the actual issue found?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Gemini predicted: {alert.failure_type}
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add resolution notes..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white h-24 resize-none"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={geminiCorrect}
                    onChange={(e) => setGeminiCorrect(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                  Gemini diagnosis was correct
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resolve Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
