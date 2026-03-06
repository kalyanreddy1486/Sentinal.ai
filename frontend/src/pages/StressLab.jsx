import React, { useState, useEffect, useRef } from 'react';

export default function StressLab() {
  const [faultType, setFaultType] = useState(null);
  const [degradation, setDegradation] = useState(0);
  const [tempStress, setTempStress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Chart data
  const [tempData, setTempData] = useState(Array(30).fill(90));
  const [vibData, setVibData] = useState(Array(30).fill(40));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const drawChart = () => {
      const width = canvas.width;
      const height = canvas.height;
      const padding = 30;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(42, 74, 106, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = padding + (height - 2 * padding) * i / 4;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      
      // Draw temp line
      ctx.strokeStyle = '#ff2d55';
      ctx.lineWidth = 2;
      ctx.beginPath();
      tempData.forEach((val, i) => {
        const x = padding + (width - 2 * padding) * i / (tempData.length - 1);
        const y = height - padding - (val - 50) * (height - 2 * padding) / 100;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // Draw vib line
      ctx.strokeStyle = '#ffaa00';
      ctx.beginPath();
      vibData.forEach((val, i) => {
        const x = padding + (width - 2 * padding) * i / (vibData.length - 1);
        const y = height - padding - (val - 20) * (height - 2 * padding) / 80;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // Legend
      ctx.font = "12px 'JetBrains Mono'";
      ctx.fillStyle = '#ff2d55';
      ctx.fillText('TEMP', width - 80, 20);
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('VIB', width - 40, 20);
    };
    
    drawChart();
  }, [tempData, vibData]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = setInterval(() => {
        setTick(t => {
          const newTick = t + 1;
          
          setTempData(prev => [...prev.slice(1), 90 + newTick * 2]);
          setVibData(prev => [...prev.slice(1), 40 + newTick]);
          
          if (newTick > 5) {
            document.getElementById('t2-bar').style.background = 'var(--amber)';
          }
          if (newTick > 10) {
            document.getElementById('t1-bar').style.background = 'var(--red)';
            setShowAlert(true);
            setConfidence(Math.min(99, 50 + newTick * 3));
          }
          
          return newTick;
        });
      }, 300);
    } else {
      clearInterval(animationRef.current);
    }
    
    return () => clearInterval(animationRef.current);
  }, [isRunning]);

  const toggleStress = () => {
    if (isRunning) {
      setIsRunning(false);
      setTick(0);
      setShowAlert(false);
      setTempData(Array(30).fill(90));
      setVibData(Array(30).fill(40));
      document.getElementById('t2-bar').style.background = 'var(--muted)';
      document.getElementById('t1-bar').style.background = 'var(--muted)';
    } else {
      setIsRunning(true);
      setTick(0);
      setShowAlert(false);
    }
  };

  return (
    <div className="p-5 h-full overflow-y-auto" style={{ background: 'radial-gradient(circle at center, rgba(255, 45, 85, 0.05) 0%, transparent 70%)' }}>
      <h2 className="orbitron text-2xl mb-5" style={{ color: 'var(--red)' }}>⚡ FAULT INJECTION SIMULATOR</h2>
      
      <div className="grid grid-cols-[1fr_2fr] gap-5 h-[calc(100vh-180px)]">
        {/* Left Panel */}
        <div className="glass-card p-5" style={{ borderColor: 'var(--red)' }}>
          <button 
            className={`fault-btn ${faultType === 'bearing' ? 'active' : ''}`}
            onClick={() => setFaultType('bearing')}
          >
            <div>
              <div className="orbitron">🔩 BEARING FAILURE</div>
              <div className="mono text-[10px] text-[var(--muted)]">vib↑ temp↑ rpm↓</div>
            </div>
          </button>
          
          <button 
            className={`fault-btn ${faultType === 'thermal' ? 'active' : ''}`}
            onClick={() => setFaultType('thermal')}
          >
            <div>
              <div className="orbitron">🌡️ THERMAL OVERLOAD</div>
              <div className="mono text-[10px] text-[var(--muted)]">temp↑↑</div>
            </div>
          </button>

          <div className="mt-8">
            <div className="mb-5">
              <div className="flex justify-between text-xs text-[var(--muted)] mb-1 mono">
                <span>DEGRADATION</span>
                <span>{degradation}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={degradation}
                onChange={(e) => setDegradation(Number(e.target.value))}
              />
            </div>
            
            <div className="mb-5">
              <div className="flex justify-between text-xs text-[var(--muted)] mb-1 mono">
                <span>TEMP STRESS</span>
                <span>+{tempStress}°C</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={tempStress}
                onChange={(e) => setTempStress(Number(e.target.value))}
              />
            </div>
          </div>

          <h3 className="text-[var(--muted)] text-xs mb-2.5 mt-5">TARGET MACHINE</h3>
          <div className="flex gap-2.5 mb-8">
            <div className="m-pill active">Pump Gamma</div>
          </div>

          <button 
            id="run-btn"
            className={`w-full text-center font-bold text-lg py-4 ${isRunning ? 'bg-[rgba(255,45,85,0.2)]' : ''}`}
            style={{ 
              border: '1px solid var(--red)', 
              color: isRunning ? '#fff' : 'var(--red)',
              background: isRunning ? 'rgba(255,45,85,0.2)' : 'transparent'
            }}
            onClick={toggleStress}
            onMouseEnter={(e) => !isRunning && (e.target.style.background = 'var(--red)', e.target.style.color = '#fff')}
            onMouseLeave={(e) => !isRunning && (e.target.style.background = 'transparent', e.target.style.color = 'var(--red)')}
          >
            {isRunning ? '■ ABORT TEST' : 'RUN TEST'}
          </button>
        </div>

        {/* Right Panel */}
        <div className="glass-card p-5">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={200}
            className="w-full"
          />
          
          <div className="flex gap-2.5 mt-5">
            <div id="t3-bar" className="flex-1 h-1 bg-[var(--muted)]" />
            <div id="t2-bar" className="flex-1 h-1 bg-[var(--muted)]" />
            <div id="t1-bar" className="flex-1 h-1 bg-[var(--muted)]" />
          </div>
          
          <div className="flex justify-between mt-1 text-[10px] mono">
            <span className="text-[var(--neon)]">TIER 3 (Rules)</span>
            <span className="text-[var(--amber)]">TIER 2 (ML Anomaly)</span>
            <span className="text-[var(--red)]">TIER 1 (SENTINEL AI)</span>
          </div>
          
          <div 
            className={`glass-card clip-card mt-5 ${showAlert ? '' : 'hidden'}`}
            style={{ borderColor: 'var(--red)' }}
          >
            <div className="orbitron text-xl" style={{ color: 'var(--red)' }}>CRITICAL ALERT DISPATCHED</div>
            <div className="mono text-xs mt-2.5">
              &gt; FAILURE: Bearing seize predicted<br />
              &gt; CONFIDENCE: {confidence}%<br />
              &gt; ACTION: Shutting down Pump Gamma in 60s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
