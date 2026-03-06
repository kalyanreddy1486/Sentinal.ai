import React, { useState, useEffect } from 'react'

function Header() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header 
      className="h-16 flex items-center justify-between px-5 fixed top-0 left-64 right-0 z-50"
      style={{ 
        background: 'rgba(6, 12, 22, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--muted)'
      }}
    >
      <div className="flex items-center gap-6">
        <div className="stat-pill">MACHINES: 4</div>
        <div className="stat-pill alert">ALERTS: 1</div>
        <div className="stat-pill">API/DAY: 14</div>
      </div>
      
      <div className="orbitron text-lg" id="clock">
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>
    </header>
  )
}

export default Header
