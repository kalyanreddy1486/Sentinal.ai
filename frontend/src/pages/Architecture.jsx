import React from 'react';

export default function Architecture() {
  return (
    <div className="p-5 h-full overflow-y-auto">
      <h2 className="orbitron text-2xl mb-8" style={{ color: 'var(--cyan)' }}>PIPELINE TOPOLOGY</h2>
      
      {/* Architecture Diagram */}
      <div className="h-[300px] flex justify-between items-center px-12 relative mb-10">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <path 
            d="M140 150 L840 150" 
            stroke="#2a4a6a" 
            strokeWidth="2" 
            strokeDasharray="5 5"
            fill="none"
          />
        </svg>
        
        <div className="arch-node">
          <div className="node-top" style={{ background: 'var(--purple)' }} />
          <div className="mono text-[10px]">DATA STREAM</div>
          <div className="orbitron">SENSORS</div>
          <div className="mono text-[10px] text-[var(--muted)] mt-1">100Hz Telemetry</div>
        </div>
        
        <div className="arch-node">
          <div className="node-top" style={{ background: 'var(--cyan)' }} />
          <div className="mono text-[10px]">LOCAL EDGE</div>
          <div className="orbitron">3-TIER DB</div>
          <div className="mono text-[10px] text-[var(--muted)] mt-1">Rules + Isolation Forest</div>
        </div>
        
        <div className="arch-node">
          <div className="node-top" style={{ background: 'var(--amber)' }} />
          <div className="mono text-[10px]">CLOUD AI</div>
          <div className="orbitron">GEMINI 1.5</div>
          <div className="mono text-[10px] text-[var(--muted)] mt-1">Root Cause Analysis</div>
        </div>
        
        <div className="arch-node">
          <div className="node-top" style={{ background: 'var(--red)' }} />
          <div className="mono text-[10px]">DISPATCH</div>
          <div className="orbitron">ALERT/UI</div>
          <div className="mono text-[10px] text-[var(--muted)] mt-1">Twilio + React</div>
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="grid grid-cols-2 gap-5">
        <div className="clip-card">
          <h3 className="orbitron">V1 APPROACH: SEND EVERY READING</h3>
          <div className="mono text-xs text-[var(--muted)]">7,200 API calls/day</div>
          <div className="h-5 w-full mt-2.5 mb-2.5" style={{ background: 'var(--red)' }} />
          <div className="orbitron text-2xl" style={{ color: 'var(--red)' }}>$21.60 / DAY</div>
        </div>
        
        <div className="clip-card" style={{ borderColor: 'var(--cyan)' }}>
          <h3 className="orbitron" style={{ color: 'var(--cyan)' }}>V2 APPROACH: 3-TIER ENGINE</h3>
          <div className="mono text-xs text-[var(--muted)]">15 API calls/day (Anomalies Only)</div>
          <div className="h-5 mt-2.5 mb-2.5" style={{ background: 'var(--cyan)', width: '2%' }} />
          <div className="orbitron text-2xl" style={{ color: 'var(--cyan)' }}>$0.04 / DAY</div>
        </div>
      </div>

      {/* System Details */}
      <div className="grid grid-cols-3 gap-5 mt-8">
        <div className="glass-card p-5">
          <div className="orbitron text-lg mb-3" style={{ color: 'var(--cyan)' }}>TIER 1: CRITICAL</div>
          <ul className="mono text-xs text-[var(--text)] space-y-2">
            <li>• Gemini AI Diagnosis</li>
            <li>• Root Cause Analysis</li>
            <li>• Maintenance Window</li>
            <li>• Parts Recommendation</li>
            <li>• WhatsApp/SMS Alert</li>
          </ul>
        </div>
        
        <div className="glass-card p-5">
          <div className="orbitron text-lg mb-3" style={{ color: 'var(--amber)' }}>TIER 2: TRENDING</div>
          <ul className="mono text-xs text-[var(--text)] space-y-2">
            <li>• Math-Based Detection</li>
            <li>• Consecutive Rises</li>
            <li>• Threshold Monitoring</li>
            <li>• Trend Analysis</li>
            <li>• Email Notification</li>
          </ul>
        </div>
        
        <div className="glass-card p-5">
          <div className="orbitron text-lg mb-3" style={{ color: 'var(--neon)' }}>TIER 3: NORMAL</div>
          <ul className="mono text-xs text-[var(--text)] space-y-2">
            <li>• No AI Calls</li>
            <li>• Local Rule Engine</li>
            <li>• Real-time Dashboard</li>
            <li>• Data Logging</li>
            <li>• Baseline Monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
