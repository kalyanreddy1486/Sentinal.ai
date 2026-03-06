import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

function Maintenance() {
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState(null);
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list, calendar
  const [productionStats, setProductionStats] = useState(null);

  useEffect(() => {
    fetchSchedules();
    fetchStats();
    fetchCalendar();
    fetchProductionDashboard();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_URL}/maintenance/schedules`);
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/maintenance/stats/optimization`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchProductionDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/production/dashboard`);
      const data = await response.json();
      setProductionStats(data);
    } catch (error) {
      console.error('Failed to fetch production stats:', error);
    }
  };

  const fetchCalendar = async () => {
    try {
      const response = await fetch(`${API_URL}/maintenance/calendar`);
      const data = await response.json();
      setCalendar(data.calendar || {});
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'proposed': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'confirmed': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'LOW': return 'text-emerald-400';
      case 'MEDIUM': return 'text-amber-400';
      case 'HIGH': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-5 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance Scheduling</h2>
          <p className="text-gray-400 text-sm mt-1">
            AI-recommended optimal maintenance windows
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'list'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-800 text-gray-400 border border-slate-700'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'calendar'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'bg-slate-800 text-gray-400 border border-slate-700'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Total Schedules</div>
            <div className="text-2xl font-bold text-white">{stats.total_schedules}</div>
          </div>
          <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Low Impact</div>
            <div className="text-2xl font-bold text-emerald-400">
              {stats.production_impact?.low_impact_percentage}%
            </div>
          </div>
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Avg Confidence</div>
            <div className="text-2xl font-bold text-cyan-400">
              {stats.average_confidence}%
            </div>
          </div>
          <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">Cost Avoidance</div>
            <div className="text-2xl font-bold text-amber-400">
              ${(stats.estimated_cost_avoidance / 1000).toFixed(0)}k
            </div>
          </div>
        </div>
      )}

      {/* Production Impact Dashboard */}
      {productionStats && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Production Impact Analysis</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{productionStats.upcoming_maintenance}</div>
              <div className="text-xs text-gray-400">Upcoming Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-400">
                ${(productionStats.total_estimated_impact / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-gray-400">Est. Production Impact</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">
                ${(productionStats.potential_savings_vs_emergency / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-gray-400">Savings vs Emergency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {productionStats.optimization_score}%
              </div>
              <div className="text-xs text-gray-400">Optimization Score</div>
            </div>
          </div>
          
          {/* Impact Distribution */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-400">Impact Distribution:</span>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                LOW: {productionStats.impact_distribution.LOW}
              </span>
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
                MEDIUM: {productionStats.impact_distribution.MEDIUM}
              </span>
              <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs">
                HIGH: {productionStats.impact_distribution.HIGH}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <p className="text-gray-400 mt-2">Loading schedules...</p>
        </div>
      ) : view === 'list' ? (
        /* List View */
        <div className="grid gap-4">
          {schedules.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Maintenance Schedules</h3>
              <p className="text-gray-400">Schedules will be created when alerts are triggered</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.schedule_id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{schedule.schedule_id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Machine: <span className="text-cyan-400">{schedule.machine_id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getImpactColor(schedule.production_impact)}`}>
                      {schedule.production_impact} Impact
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {schedule.confidence_score}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Start Time</div>
                    <div className="text-white font-medium">{formatDate(schedule.recommended_start)}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="text-white font-medium">{schedule.duration_hours} hours</div>
                  </div>
                </div>

                {schedule.reasoning && (
                  <div className="text-sm text-gray-400 bg-slate-900/30 rounded-lg p-3 mb-4">
                    <span className="text-gray-500">AI Reasoning:</span> {schedule.reasoning}
                  </div>
                )}

                {schedule.required_parts && schedule.required_parts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {schedule.required_parts.map((part, idx) => (
                      <span key={idx} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                        {part}
                      </span>
                    ))}
                  </div>
                )}

                {schedule.status === 'proposed' && (
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors">
                      Confirm Schedule
                    </button>
                    <button className="flex-1 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors">
                      Reschedule
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Maintenance Calendar</h3>
          {Object.keys(calendar).length === 0 ? (
            <p className="text-gray-400 text-center py-8">No scheduled maintenance in the next 30 days</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(calendar).map(([date, items]) => (
                <div key={date} className="border-l-2 border-cyan-500/50 pl-4">
                  <div className="text-sm text-cyan-400 font-medium mb-2">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-white font-medium">{item.machine_id}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(item.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -
                            {new Date(item.end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Maintenance;
