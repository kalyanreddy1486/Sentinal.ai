import React, { useState } from 'react';

export default function ROIEngine() {
  const [fleetSize, setFleetSize] = useState(12);
  const [incidents, setIncidents] = useState(8);
  const [costPerIncident, setCostPerIncident] = useState(180);
  const [downtimeReduction, setDowntimeReduction] = useState(40);

  const totalSavings = incidents * (costPerIncident * 1000) * (downtimeReduction / 100);
  const incidentsPrevented = Math.round(incidents * (downtimeReduction / 100));
  const paybackPeriod = totalSavings > 0 ? Math.max(1, Math.round(5000 / (totalSavings / 365))) : 0;

  const setPreset = (a, b, c, d) => {
    setFleetSize(a);
    setIncidents(b);
    setCostPerIncident(c);
    setDowntimeReduction(d);
  };

  return (
    <div className="p-5 h-full overflow-y-auto">
      <div className="grid grid-cols-[1fr_1.5fr] gap-10">
        {/* Left Panel */}
        <div className="glass-card clip-card p-5">
          <h2 className="orbitron text-2xl mb-2" style={{ color: 'var(--neon)' }}>ROI ENGINE</h2>
          <div className="mono text-xs text-[var(--muted)] mb-5">Parameter simulation</div>

          <div className="flex gap-2 mb-5">
            <button className="chip" onClick={() => setPreset(12, 8, 180, 40)}>AUTO</button>
            <button className="chip" onClick={() => setPreset(50, 25, 300, 50)}>STEEL</button>
            <button className="chip" onClick={() => setPreset(120, 40, 500, 60)}>OIL & GAS</button>
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1 mono">
              <span>FLEET SIZE</span>
              <span>{fleetSize}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="200" 
              value={fleetSize}
              onChange={(e) => setFleetSize(Number(e.target.value))}
              style={{ accentColor: 'var(--cyan)' }}
            />
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1 mono">
              <span>INCIDENTS / YR</span>
              <span>{incidents}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={incidents}
              onChange={(e) => setIncidents(Number(e.target.value))}
            />
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1 mono">
              <span>COST PER INCIDENT ($K)</span>
              <span>${costPerIncident}K</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="2000" 
              value={costPerIncident}
              onChange={(e) => setCostPerIncident(Number(e.target.value))}
            />
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-xs text-[var(--muted)] mb-1 mono">
              <span>DOWNTIME REDUCTION</span>
              <span>{downtimeReduction}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="80" 
              value={downtimeReduction}
              onChange={(e) => setDowntimeReduction(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="glass-card p-8 flex flex-col justify-center items-center">
          <div className="orbitron giant-num">
            ${totalSavings.toLocaleString()}
          </div>
          <div className="mono text-[var(--muted)] mt-2.5">ESTIMATED ANNUAL SAVINGS</div>

          <div className="grid grid-cols-2 gap-4 mt-5 w-full">
            <div className="roi-card">
              <div className="mono text-[10px] text-[var(--muted)]">INCIDENTS PREVENTED</div>
              <div className="orbitron text-xl">{incidentsPrevented} / yr</div>
            </div>
            <div className="roi-card">
              <div className="mono text-[10px] text-[var(--muted)]">PAYBACK PERIOD</div>
              <div className="orbitron text-xl">{paybackPeriod} Days</div>
            </div>
          </div>

          <div className="mt-8 w-full text-center">
            <div className="orbitron text-4xl" style={{ color: 'var(--red)' }}>$1.4 TRILLION</div>
            <div className="mono text-xs text-[var(--muted)]">
              lost annually by top 500 companies to unplanned downtime
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 w-full">
            <div className="text-center p-4 bg-[rgba(255,255,255,0.02)]">
              <div className="orbitron text-2xl text-[var(--cyan)]">85%</div>
              <div className="mono text-[10px] text-[var(--muted)]">REDUCTION IN UNPLANNED DOWNTIME</div>
            </div>
            <div className="text-center p-4 bg-[rgba(255,255,255,0.02)]">
              <div className="orbitron text-2xl text-[var(--neon)]">3.2x</div>
              <div className="mono text-[10px] text-[var(--muted)]">AVERAGE ROI MULTIPLIER</div>
            </div>
            <div className="text-center p-4 bg-[rgba(255,255,255,0.02)]">
              <div className="orbitron text-2xl text-[var(--amber)]">6h</div>
              <div className="mono text-[10px] text-[var(--muted)]">AVG LEAD TIME WARNING</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
