import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const machines = {
  A: { id: 'A', name: 'Turbine Alpha', type: 'Gas Turbine', bay: 'Bay 1', health: 82, fp: 18, tier: 3, s: { temp: 89, pressure: 86, rpm: 3100, flow: 42 }, crit: false, color: '--neon' },
  B: { id: 'B', name: 'Compressor Beta', type: 'Air Compressor', bay: 'Bay 2', health: 64, fp: 44, tier: 2, s: { temp: 81, pressure: 82, flow: 140, vib: 2.9 }, crit: false, color: '--amber' },
  C: { id: 'C', name: 'Pump Gamma', type: 'Hydraulic Pump', bay: 'Bay 3', health: 31, fp: 75, tier: 1, s: { temp: 95, vib: 4.1, rpm: 2940, pressure: 79 }, crit: true, color: '--red' },
  D: { id: 'D', name: 'Motor Delta', type: 'Drive Motor', bay: 'Bay 4', health: 91, fp: 9, tier: 3, s: { temp: 72, vib: 1.8, current: 38, rpm: 2850 }, crit: false, color: '--neon' }
};

function Gauge({ value, isCrit, size = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    // Fill arc
    const endAngle = 0.75 * Math.PI + (1.5 * Math.PI * (value / 100));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0.75 * Math.PI, endAngle);
    ctx.strokeStyle = isCrit ? '#ff2d55' : (value > 70 ? '#00ffcc' : '#ffaa00');
    ctx.stroke();

    // Text
    ctx.fillStyle = '#d0e8ff';
    ctx.font = `bold ${size / 5}px Orbitron`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(value) + '%', cx, cy - 5);
    ctx.font = `${size / 12}px 'JetBrains Mono'`;
    ctx.fillStyle = '#2a4a6a';
    ctx.fillText('HEALTH', cx, cy + 15);
  }, [value, isCrit, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * ease);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{prefix}{displayValue.toFixed(1)}{suffix}</span>;
}

export default function Dashboard({ onNavigate }) {
  const [machineData, setMachineData] = useState(machines);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // WebSocket connection - stable client ID
  const clientId = useMemo(() => 'dashboard-' + Math.random().toString(36).substr(2, 9), []);
  const { isConnected, machineData: wsMachineData, subscribeToMachine } = useWebSocket(clientId);
  const [newMachine, setNewMachine] = useState({
    name: '',
    type: '',
    bay: '',
    health: 100,
    tier: 3,
    sensors: { temp: 75, pressure: 80, rpm: 3000 },
    script: ''
  });

  const handleAddMachine = () => {
    const id = String.fromCharCode(65 + Object.keys(machineData).length); // A, B, C, D, E...
    const machine = {
      id,
      name: newMachine.name || `Machine ${id}`,
      type: newMachine.type || 'Industrial Machine',
      bay: newMachine.bay || `Bay ${Object.keys(machineData).length + 1}`,
      health: Number(newMachine.health),
      fp: 0,
      tier: Number(newMachine.tier),
      s: { ...newMachine.sensors },
      crit: false,
      color: '--neon',
      script: newMachine.script || null
    };
    setMachineData(prev => ({ ...prev, [id]: machine }));
    setShowAddModal(false);
    setNewMachine({
      name: '',
      type: '',
      bay: '',
      health: 100,
      tier: 3,
      sensors: { temp: 75, pressure: 80, rpm: 3000 },
      script: ''
    });
  };

  // Subscribe to all machines via WebSocket
  useEffect(() => {
    if (isConnected) {
      Object.keys(machineData).forEach(id => {
        subscribeToMachine(id);
      });
    }
  }, [isConnected, subscribeToMachine]);

  // Update machine data from WebSocket
  useEffect(() => {
    if (Object.keys(wsMachineData).length > 0) {
      setMachineData(prev => {
        const updated = { ...prev };
        Object.entries(wsMachineData).forEach(([id, data]) => {
          if (updated[id] && data.sensors) {
            updated[id] = {
              ...updated[id],
              s: {
                temp: data.sensors.temperature || updated[id].s.temp,
                pressure: data.sensors.pressure || updated[id].s.pressure,
                rpm: data.sensors.rpm || updated[id].s.rpm,
                vib: data.sensors.vibration || updated[id].s.vib,
                ...updated[id].s
              },
              health: data.health_score || updated[id].health,
              fp: data.failure_probability || updated[id].fp,
              tier: data.tier?.level || updated[id].tier
            };
          }
        });
        return updated;
      });
    }
  }, [wsMachineData]);

  // Fallback: Local simulation if WebSocket not connected
  useEffect(() => {
    if (isConnected) return; // Skip if WebSocket is connected
    
    const interval = setInterval(() => {
      setMachineData(prev => {
        const updated = { ...prev };
        Object.values(updated).forEach(m => {
          const keys = Object.keys(m.s);
          keys.forEach(k => { m.s[k] += (Math.random() - 0.5) * 1.5; });
          if (m.crit) {
            m.s.temp += 0.3;
            m.s.vib += 0.08;
            m.health -= 0.5;
          } else {
            m.health += (Math.random() - 0.5) * 0.5;
          }
          m.health = Math.max(0, Math.min(100, m.health));
        });
        return { ...updated };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const mArr = Object.values(machineData);

  return (
    <div className="p-5 overflow-y-auto h-full">
      {/* Connection Status */}
      <div className="flex justify-end mb-3">
        <div className={`flex items-center gap-2 px-3 py-1 text-xs mono ${isConnected ? 'text-[var(--neon)]' : 'text-[var(--amber)]'}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--neon)] animate-pulse' : 'bg-[var(--amber)]'}`}></span>
          {isConnected ? 'LIVE DATA (WebSocket)' : 'LOCAL SIMULATION'}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-5 mb-5">
        <div className="glass-card kpi-card">
          <div className="kpi-wm">76</div>
          <div className="orbitron kpi-val">
            <AnimatedNumber value={76.4} suffix="%" />
          </div>
          <div className="kpi-lbl">FLEET HEALTH</div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-wm">48</div>
          <div className="orbitron kpi-val neon">
            <AnimatedNumber value={48.2} prefix="$" suffix="K" />
          </div>
          <div className="kpi-lbl">DOWNTIME SAVED</div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-wm">91</div>
          <div className="orbitron kpi-val amber">
            <AnimatedNumber value={91.3} suffix="%" />
          </div>
          <div className="kpi-lbl">SENTINEL ACCURACY</div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-wm">6</div>
          <div className="orbitron kpi-val">
            <AnimatedNumber value={6.2} suffix="h" />
          </div>
          <div className="kpi-lbl">FAILURE LEAD TIME</div>
        </div>
      </div>

      {/* Ticker */}
      <div 
        className="bg-[var(--surface)] border border-[var(--muted)] h-[30px] flex items-center overflow-hidden mb-5 relative"
        onMouseEnter={() => setTickerPaused(true)}
        onMouseLeave={() => setTickerPaused(false)}
      >
        <div 
          className="whitespace-nowrap mono text-sm"
          style={{
            animation: tickerPaused ? 'none' : 'marquee 20s linear infinite'
          }}
        >
          🔴 CRITICAL — Pump Gamma — Bearing Failure — 87% confidence — 8 min to breach — John Smith notified │ ⚠️
          WARNING — Compressor Beta — 11 consecutive rises — Tier 2 active │ ✅ Motor Delta — All nominal │ ✅
          Turbine Alpha — All nominal
        </div>
      </div>

      {/* Add Machine Button */}
      <div className="mb-5">
        <button 
          className="cyber-btn"
          onClick={() => setShowAddModal(true)}
        >
          + ADD NEW MACHINE
        </button>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-2 gap-5">
        {mArr.map(m => (
          <div key={m.id} className={`clip-card machine-card ${m.crit ? 'critical-glow' : ''}`}>
            {m.crit && <div className="critical-wm">CRITICAL</div>}
            <header className="flex justify-between mb-2.5">
              <div>
                <div className="orbitron text-lg" style={{ color: m.crit ? 'var(--red)' : 'var(--cyan)' }}>
                  {m.name}
                </div>
                <div className="mono text-[10px]">{m.type} | {m.bay}</div>
              </div>
              <div className={`tier-badge tier-${m.tier}`}>TIER {m.tier}</div>
            </header>
            <div className="flex flex-col items-center my-4">
              <Gauge value={m.health} isCrit={m.crit} size={120} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(m.s).map(([k, v]) => (
                <div key={`${m.id}-${k}`} className="sensor-chip">
                  <span className="text-xs text-[var(--muted)]">{k.toUpperCase()}</span>
                  <span className="text-sm text-[var(--cyan)]">{v.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center border-t border-[var(--muted)] pt-2.5">
              <div className="mono text-[10px]">
                <span className="text-[var(--neon)]">●</span> LIVE DATA
              </div>
              <button 
                className="cyber-btn"
                onClick={() => onNavigate && onNavigate('copilot', m.id)}
              >
                ANALYZE →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Machine Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="glass-card p-6 w-[400px]" style={{ borderColor: 'var(--cyan)' }}>
            <h3 className="orbitron text-xl mb-4 text-[var(--cyan)]">ADD NEW MACHINE</h3>
            
            <div className="space-y-4">
              <div>
                <label className="mono text-xs text-[var(--muted)] block mb-1">MACHINE NAME</label>
                <input
                  type="text"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pump Epsilon"
                  className="w-full bg-[var(--deep)] border border-[var(--muted)] p-2 text-[var(--text)] mono text-sm"
                />
              </div>
              
              <div>
                <label className="mono text-xs text-[var(--muted)] block mb-1">TYPE</label>
                <input
                  type="text"
                  value={newMachine.type}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g., Hydraulic Pump"
                  className="w-full bg-[var(--deep)] border border-[var(--muted)] p-2 text-[var(--text)] mono text-sm"
                />
              </div>
              
              <div>
                <label className="mono text-xs text-[var(--muted)] block mb-1">BAY LOCATION</label>
                <input
                  type="text"
                  value={newMachine.bay}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, bay: e.target.value }))}
                  placeholder="e.g., Bay 5"
                  className="w-full bg-[var(--deep)] border border-[var(--muted)] p-2 text-[var(--text)] mono text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-xs text-[var(--muted)] block mb-1">INITIAL HEALTH (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newMachine.health}
                    onChange={(e) => setNewMachine(prev => ({ ...prev, health: e.target.value }))}
                    className="w-full bg-[var(--deep)] border border-[var(--muted)] p-2 text-[var(--text)] mono text-sm"
                  />
                </div>
                <div>
                  <label className="mono text-xs text-[var(--muted)] block mb-1">TIER</label>
                  <select
                    value={newMachine.tier}
                    onChange={(e) => setNewMachine(prev => ({ ...prev, tier: e.target.value }))}
                    className="w-full bg-[var(--deep)] border border-[var(--muted)] p-2 text-[var(--text)] mono text-sm"
                  >
                    <option value={3}>Tier 3 (Normal)</option>
                    <option value={2}>Tier 2 (Trending)</option>
                    <option value={1}>Tier 1 (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mono text-xs text-[var(--muted)] block mb-1">SIMULATION SCRIPT (OPTIONAL)</label>
                <textarea
                  value={newMachine.script}
                  onChange={(e) => setNewMachine(prev => ({ ...prev, script: e.target.value }))}
                  placeholder="// Example: Custom degradation logic&#10;function simulate(data) {&#10;  data.temp += 0.5;&#10;  data.vibration *= 1.02;&#10;  return data;&#10;}"
                  rows={5}
                  className="w-full bg-[var(--deep)] border border-[var(--muted)] p-2 text-[var(--text)] mono text-xs resize-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
                <span className="mono text-[10px] text-[var(--muted)]">
                  Define custom JavaScript for sensor behavior simulation
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                className="cyber-btn flex-1"
                onClick={handleAddMachine}
              >
                CREATE
              </button>
              <button 
                className="cyber-btn cyber-btn-red flex-1"
                onClick={() => setShowAddModal(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
