import React, { useState, useEffect } from 'react';

const initialMachines = {
  A: { id: 'A', name: 'Turbine Alpha', type: 'Gas Turbine', bay: 'Bay 1', health: 82, fp: 18, tier: 3, s: { temp: 89, pressure: 86, rpm: 3100, flow: 42 }, crit: false, color: '--neon' },
  B: { id: 'B', name: 'Compressor Beta', type: 'Air Compressor', bay: 'Bay 2', health: 64, fp: 44, tier: 2, s: { temp: 81, pressure: 82, flow: 140, vib: 2.9 }, crit: false, color: '--amber' },
  C: { id: 'C', name: 'Pump Gamma', type: 'Hydraulic Pump', bay: 'Bay 3', health: 31, fp: 75, tier: 1, s: { temp: 95, vib: 4.1, rpm: 2940, pressure: 79 }, crit: true, color: '--red' },
  D: { id: 'D', name: 'Motor Delta', type: 'Drive Motor', bay: 'Bay 4', health: 91, fp: 9, tier: 3, s: { temp: 72, vib: 1.8, current: 38, rpm: 2850 }, crit: false, color: '--neon' }
};

function TurbineSVG({ color, isSpinning }) {
  return (
    <svg width="150" height="150" viewBox="0 0 100 100" stroke={`var(${color})`} fill="none" className={isSpinning ? 'svg-blade' : ''}>
      <circle cx="50" cy="50" r="40" strokeWidth="2" />
      <circle cx="50" cy="50" r="10" strokeWidth="2" />
      <line x1="50" y1="10" x2="50" y2="90" strokeWidth="2" />
      <line x1="10" y1="50" x2="90" y2="50" strokeWidth="2" />
      <line x1="22" y1="22" x2="78" y2="78" strokeWidth="2" />
      <line x1="78" y1="22" x2="22" y2="78" strokeWidth="2" />
    </svg>
  );
}

function CompressorSVG({ color, isPumping }) {
  return (
    <svg width="150" height="150" viewBox="0 0 100 100" stroke={`var(${color})`} fill="none">
      <rect x="30" y="20" width="40" height="60" strokeWidth="2" />
      <line x1="30" y1="35" x2="70" y2="35" strokeWidth="1" />
      <line x1="30" y1="50" x2="70" y2="50" strokeWidth="1" />
      <line x1="30" y1="65" x2="70" y2="65" strokeWidth="1" />
      <rect x="35" y="25" width="30" height="10" fill={`var(${color})`} fillOpacity="0.3" className={isPumping ? 'svg-piston' : ''} />
    </svg>
  );
}

function PumpSVG({ color, isFlowing }) {
  return (
    <svg width="150" height="150" viewBox="0 0 100 100" stroke={`var(${color})`} fill="none">
      <circle cx="50" cy="50" r="35" strokeWidth="2" />
      <path d="M50 15 L60 35 L40 35 Z" fill={`var(${color})`} fillOpacity="0.3" />
      <circle cx="50" cy="50" r="8" fill={`var(${color})`} />
      <line x1="50" y1="15" x2="50" y2="85" strokeWidth="2" className={isFlowing ? 'svg-flow' : ''} />
      <line x1="15" y1="50" x2="85" y2="50" strokeWidth="2" />
    </svg>
  );
}

function MotorSVG({ color, isRunning }) {
  return (
    <svg width="150" height="150" viewBox="0 0 100 100" stroke={`var(${color})`} fill="none">
      <rect x="25" y="30" width="50" height="40" rx="5" strokeWidth="2" />
      <circle cx="50" cy="50" r="12" strokeWidth="2" />
      <line x1="75" y1="40" x2="90" y2="40" strokeWidth="2" />
      <line x1="75" y1="60" x2="90" y2="60" strokeWidth="2" />
      <circle cx="50" cy="50" r="5" fill={`var(${color})`} className={isRunning ? 'animate-pulse' : ''} />
    </svg>
  );
}

export default function TwinForge() {
  const [machines, setMachines] = useState(initialMachines);

  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev => {
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
  }, []);

  const getMachineSVG = (m) => {
    switch (m.id) {
      case 'A': return <TurbineSVG color={m.color} isSpinning={true} />;
      case 'B': return <CompressorSVG color={m.color} isPumping={true} />;
      case 'C': return <PumpSVG color={m.color} isFlowing={true} />;
      case 'D': return <MotorSVG color={m.color} isRunning={true} />;
      default: return <TurbineSVG color={m.color} isSpinning={false} />;
    }
  };

  const mArr = Object.values(machines);

  return (
    <div className="p-5 h-[calc(100vh-100px)]">
      <div className="grid grid-cols-2 gap-5 h-full">
        {mArr.map(m => (
          <div 
            key={m.id} 
            className="glass-card flex flex-col relative overflow-hidden"
            style={{ borderColor: `var(${m.color})` }}
          >
            {/* Background Glow */}
            <div 
              className="absolute inset-0 transition-colors duration-1000 -z-0"
              style={{ 
                background: `radial-gradient(circle, var(${m.color}) 0%, transparent 70%)`,
                opacity: 0.1
              }}
            />
            
            {/* Header */}
            <div className="flex justify-between p-4 z-10">
              <span className="orbitron">{m.name}</span>
              <span className="mono" style={{ color: `var(${m.color})` }}>
                H:{Math.round(m.health)}%
              </span>
            </div>
            
            {/* SVG Animation */}
            <div className="flex-1 flex items-center justify-center z-10">
              {getMachineSVG(m)}
            </div>
            
            {/* Sensors */}
            <div className="flex justify-around p-2.5 bg-black/50 z-10 mono text-xs">
              {Object.entries(m.s).map(([k, v]) => (
                <span key={`${m.id}-${k}`}>{k}:{v.toFixed(1)}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
