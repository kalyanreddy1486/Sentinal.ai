import React, { useState, useEffect, useRef } from 'react';

const machines = {
  A: { id: 'A', name: 'Turbine Alpha', type: 'Gas Turbine', bay: 'Bay 1', health: 82, fp: 18, tier: 3, s: { temp: 89, pressure: 86, rpm: 3100, flow: 42 }, crit: false, color: '--neon' },
  B: { id: 'B', name: 'Compressor Beta', type: 'Air Compressor', bay: 'Bay 2', health: 64, fp: 44, tier: 2, s: { temp: 81, pressure: 82, flow: 140, vib: 2.9 }, crit: false, color: '--amber' },
  C: { id: 'C', name: 'Pump Gamma', type: 'Hydraulic Pump', bay: 'Bay 3', health: 31, fp: 75, tier: 1, s: { temp: 95, vib: 4.1, rpm: 2940, pressure: 79 }, crit: true, color: '--red' },
  D: { id: 'D', name: 'Motor Delta', type: 'Drive Motor', bay: 'Bay 4', health: 91, fp: 9, tier: 3, s: { temp: 72, vib: 1.8, current: 38, rpm: 2850 }, crit: false, color: '--neon' }
};

function Gauge({ value, isCrit }) {
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

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    const endAngle = 0.75 * Math.PI + (1.5 * Math.PI * (value / 100));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0.75 * Math.PI, endAngle);
    ctx.strokeStyle = isCrit ? '#ff2d55' : (value > 70 ? '#00ffcc' : '#ffaa00');
    ctx.stroke();

    ctx.fillStyle = '#d0e8ff';
    ctx.font = 'bold 24px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(value) + '%', cx, cy - 5);
    ctx.font = "10px 'JetBrains Mono'";
    ctx.fillStyle = '#2a4a6a';
    ctx.fillText('HEALTH', cx, cy + 15);
  }, [value, isCrit]);

  return <canvas ref={canvasRef} width={150} height={150} />;
}

export default function Copilot({ initialMachineId = 'C' }) {
  const [selectedM, setSelectedM] = useState(initialMachineId);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const mArr = Object.values(machines);
  const m = machines[selectedM];

  useEffect(() => {
    // Welcome message
    const welcomeText = `SENTINEL COPILOT ONLINE. I have eyes on all 4 machines. \n⚠️ PRIORITY ALERT: Pump Gamma — Bay 3 — Bearing failure at 87% confidence. Vibration: 4.1mm/s rising. Temperature: 95°C rising. RPM: 2,940 dropping. John Smith notified at 09:15. Estimated time to threshold breach: 7 minutes.\nWhat do you need to know?`;
    const timer = setTimeout(() => typeMessage(welcomeText, true), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typeMessage = (text, isAi = false) => {
    setIsTyping(true);
    const id = Date.now();
    setMessages(prev => [...prev, { id, text: '', isAi, fullText: text }]);
    
    let i = 0;
    const interval = setInterval(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, text: text.slice(0, i + 1) } : msg
      ));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  const sendMessage = (forceText = null) => {
    const text = forceText || inputValue;
    if (!text || isTyping) return;
    
    setInputValue('');
    const userMsgId = Date.now();
    setMessages(prev => [...prev, { id: userMsgId, text, isAi: false, fullText: text }]);

    let response = "Analyzing telemetry... data is nominal.";
    if (text.toLowerCase().includes('why')) {
      response = "Based on spectral analysis of vibration data (4.1mm/s), the 2X RPM harmonic indicates severe inner race defect on the main drive bearing. Temperature rise correlates directly with mechanical friction.";
    } else if (text.toLowerCase().includes('window')) {
      response = "Recommendation: Safe to run for 6 hours. Schedule shutdown at 16:00 shift change. Mechanic John Smith is standing by with replacement part #B-992.";
    } else if (text.toLowerCase().includes('fleet') || text.toLowerCase().includes('comparison')) {
      response = "Fleet Health Summary:\n• Turbine Alpha: 82% - Nominal\n• Compressor Beta: 64% - Trending (Tier 2)\n• Pump Gamma: 31% - CRITICAL (Tier 1)\n• Motor Delta: 91% - Excellent";
    }

    setTimeout(() => typeMessage(response, true), 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-5 p-5">
      {/* Chat Area */}
      <div className="flex-[6] flex flex-col bg-[var(--surface)] border border-[var(--muted)]">
        <div className="p-4 border-b border-[var(--muted)] flex gap-2.5 items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#bf5af2">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <div className="orbitron" style={{ color: 'var(--purple)' }}>SENTINEL COPILOT</div>
          <div className="mono text-[10px] text-[var(--muted)]">Powered by SENTINEL AI</div>
          <div className="w-2 h-2 bg-[var(--neon)] rounded-full ml-auto"></div>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`msg ${msg.isAi ? 'ai' : 'user'}`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {msg.text}
              {msg.isAi && isTyping && msg.text.length < msg.fullText?.length && (
                <span className="animate-pulse">▌</span>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-[var(--muted)]">
          <div className="flex gap-2.5 overflow-x-auto mb-2.5 pb-1">
            <button className="chip" onClick={() => sendMessage('WHY IS PUMP GAMMA FAILING?')}>
              WHY IS PUMP GAMMA FAILING?
            </button>
            <button className="chip" onClick={() => sendMessage('SAFEST MAINTENANCE WINDOW?')}>
              SAFEST MAINTENANCE WINDOW?
            </button>
            <button className="chip" onClick={() => sendMessage('FLEET HEALTH COMPARISON')}>
              FLEET HEALTH COMPARISON
            </button>
          </div>
          <div className="flex bg-[var(--deep)] border border-[var(--muted)] p-2.5 items-center">
            <span className="text-[var(--cyan)] mr-2">&gt;</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask SENTINEL..."
              className="flex-1 bg-transparent border-none text-[var(--text)] mono outline-none"
            />
            <button className="cyber-btn" onClick={() => sendMessage()}>SEND</button>
          </div>
        </div>
      </div>

      {/* Telemetry Panel */}
      <div className="flex-[4] bg-[var(--surface)] border border-[var(--muted)] p-5 flex flex-col">
        <div className="flex gap-2.5 mb-5">
          {mArr.map(x => (
            <div 
              key={x.id}
              className={`m-pill ${x.id === selectedM ? 'active' : ''}`}
              onClick={() => setSelectedM(x.id)}
            >
              {x.name}
            </div>
          ))}
        </div>
        
        <div className="orbitron text-2xl mb-1" style={{ color: `var(${m.color})` }}>{m.name}</div>
        <div className={`tier-badge tier-${m.tier} inline-block mb-5`}>TIER {m.tier}</div>
        
        <div>
          {Object.entries(m.s).map(([k, v]) => (
            <div key={`${m.id}-${k}`} className="tele-row">
              <div className="tele-lbl">{k.toUpperCase()}</div>
              <div className="tele-bar-bg">
                <div 
                  className="tele-bar-fill" 
                  style={{ 
                    width: `${Math.min(v, 100)}%`, 
                    background: `var(${m.crit ? '--red' : '--cyan'})` 
                  }}
                />
              </div>
              <div className="tele-val">{v.toFixed(1)}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-5">
          <Gauge value={m.health} isCrit={m.crit} />
        </div>

        <div className="diag-box mt-auto">
          <div className="mono text-[var(--muted)] mb-2.5 text-xs">LAST DIAGNOSIS</div>
          <div className="mono text-[var(--text)] text-xs">
            {m.crit 
              ? `CRITICAL: Bearing failure predicted with 87% confidence. Immediate attention required.` 
              : "Nominal operation. No anomalies detected in the last 24 hours."}
          </div>
        </div>
      </div>
    </div>
  );
}
