import { useState } from 'react';
import { API_BASE_URL } from '../../config';

export default function WindowCalculator({ machineId, onWindowSelect }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [params, setParams] = useState({
    predicted_failure_hours: 24,
    maintenance_duration_hours: 2.5,
    parts_available: true,
    mechanic_available: true
  });

  const calculateWindows = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/maintenance/calculate-optimal-windows/${machineId}?` +
        `predicted_failure_hours=${params.predicted_failure_hours}&` +
        `maintenance_duration_hours=${params.maintenance_duration_hours}&` +
        `parts_available=${params.parts_available}&` +
        `mechanic_available=${params.mechanic_available}`,
        { method: 'POST' }
      );
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to calculate windows:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/50';
    if (score >= 60) return 'bg-cyan-500/20 border-cyan-500/50';
    if (score >= 40) return 'bg-amber-500/20 border-amber-500/50';
    return 'bg-rose-500/20 border-rose-500/50';
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Optimal Window Calculator</h3>
      
      {/* Parameters */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-slate-400">Hours to Predicted Failure</label>
          <input
            type="number"
            value={params.predicted_failure_hours}
            onChange={(e) => setParams({...params, predicted_failure_hours: parseFloat(e.target.value)})}
            className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Maintenance Duration (hours)</label>
          <input
            type="number"
            step="0.5"
            value={params.maintenance_duration_hours}
            onChange={(e) => setParams({...params, maintenance_duration_hours: parseFloat(e.target.value)})}
            className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
          />
        </div>
      </div>
      
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={params.parts_available}
            onChange={(e) => setParams({...params, parts_available: e.target.checked})}
            className="rounded bg-slate-700 border-slate-600"
          />
          Parts Available
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={params.mechanic_available}
            onChange={(e) => setParams({...params, mechanic_available: e.target.checked})}
            className="rounded bg-slate-700 border-slate-600"
          />
          Mechanic Available
        </label>
      </div>
      
      <button
        onClick={calculateWindows}
        disabled={loading}
        className="w-full px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Calculate Optimal Windows'}
      </button>
      
      {/* Results */}
      {results && (
        <div className="mt-5 space-y-4">
          {/* Recommendation Summary */}
          <div className={`p-4 rounded-lg border ${getScoreBg(results.recommendation.best_window?.score || 0)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                {results.recommendation.recommendation}
              </span>
              {results.recommendation.best_window && (
                <span className={`text-2xl font-bold ${getScoreColor(results.recommendation.best_window.score)}`}>
                  {results.recommendation.best_window.score}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300">{results.recommendation.message}</p>
            
            {results.recommendation.top_reasoning && (
              <ul className="mt-2 space-y-1">
                {results.recommendation.top_reasoning.map((reason, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                    <span>•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Window Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Top Windows</h4>
            {results.optimal_windows.map((window, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
                onClick={() => onWindowSelect?.(window)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white">
                    {formatDate(window.start)}
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(window.overall_score)}`}>
                    {window.overall_score}
                  </div>
                </div>
                
                {/* Score Breakdown */}
                <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                  <div className="text-center">
                    <div className="text-slate-500">Urgency</div>
                    <div className={getScoreColor(window.urgency_score)}>{window.urgency_score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500">Production</div>
                    <div className={getScoreColor(window.production_score)}>{window.production_score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500">Resources</div>
                    <div className={getScoreColor(window.availability_score)}>{window.availability_score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500">Confidence</div>
                    <div className="text-slate-300">{window.confidence}%</div>
                  </div>
                </div>
                
                {/* Key Reasoning */}
                {window.reasoning && window.reasoning[0] && (
                  <div className="text-xs text-slate-500 truncate">
                    {window.reasoning[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
