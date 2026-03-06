import { useState, useEffect } from 'react';
import AlertCard from '../components/Alerts/AlertCard';
import EscalationTimer from '../components/Alerts/EscalationTimer';

const API_URL = 'http://localhost:8000';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Fetch alerts
  useEffect(() => {
    fetchAlerts();
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAlerts();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const url = filter === 'all' 
        ? `${API_URL}/alerts/`
        : `${API_URL}/alerts/?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/alerts/stats/summary`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      // Using mechanic_id 1 for demo
      const response = await fetch(`${API_URL}/alerts/${alertId}/acknowledge?mechanic_id=1`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchAlerts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to acknowledge:', error);
    }
  };

  const handleResolve = async (alertId, resolution, notes, geminiCorrect, actualFailure) => {
    try {
      const response = await fetch(
        `${API_URL}/alerts/${alertId}/resolve?mechanic_id=1&resolution=${resolution}&notes=${encodeURIComponent(notes)}&actual_failure=${encodeURIComponent(actualFailure)}&gemini_was_correct=${geminiCorrect}`,
        { method: 'POST' }
      );
      if (response.ok) {
        fetchAlerts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };

  const handleMechanicResponse = async (alertId, responseType, etaMinutes, notes) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: responseType,
          eta_minutes: etaMinutes,
          notes: notes
        })
      });
      
      if (response.ok) {
        fetchAlerts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to submit mechanic response:', error);
    }
  };

  const filteredAlerts = alerts;

  return (
    <div className="p-5 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Active Alerts</h2>
          <p className="text-gray-400 text-sm mt-1">
            Monitor and respond to machine alerts
          </p>
        </div>
        
        <div className="flex gap-2">
          {['all', 'open', 'acknowledged', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-cyan-500/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Total Alerts</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Open</div>
            <div className="text-2xl font-bold text-rose-400">{stats.by_status.open}</div>
          </div>
          <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Acknowledged</div>
            <div className="text-2xl font-bold text-amber-400">{stats.by_status.acknowledged}</div>
          </div>
          <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Resolved</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.by_status.resolved}</div>
          </div>
          <div className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Critical</div>
            <div className="text-2xl font-bold text-rose-400">{stats.by_severity.critical}</div>
          </div>
        </div>
      )}

      {/* Alert List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <p className="text-gray-400 mt-2">Loading alerts...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Active Alerts</h3>
          <p className="text-gray-400">All systems are operating normally</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.alert_id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onMechanicResponse={handleMechanicResponse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Alerts
