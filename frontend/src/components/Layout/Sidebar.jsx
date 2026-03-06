import React from 'react'

const menuItems = [
  { id: 'dashboard', label: 'COMMAND', icon: '◈' },
  { id: 'alerts', label: 'ALERTS', icon: '⚠' },
  { id: 'maintenance', label: 'MAINTENANCE', icon: '🔧' },
  { id: 'copilot', label: 'COPILOT', icon: '◉' },
  { id: 'nasavalidation', label: 'NASA VALIDATION', icon: '🚀' },
  { id: 'stresslab', label: 'STRESS LAB', icon: '⚡' },
  { id: 'twinforge', label: 'TWIN FORGE', icon: '◊' },
  { id: 'roiengine', label: 'ROI ENGINE', icon: '◐' },
]

function Sidebar({ currentView, setCurrentView }) {
  return (
    <aside className="w-64 bg-[var(--surface)] border-r border-[var(--muted)] flex flex-col">
      <div className="p-6 border-b border-[var(--muted)]">
        <div className="flex items-center gap-3">
          <svg className="hex-spin w-8 h-8" viewBox="0 0 100 100">
            <polygon points="50 5, 95 27.5, 95 72.5, 50 95, 5 72.5, 5 27.5" fill="none" stroke="#00c8ff" strokeWidth="4" />
          </svg>
          <div>
            <h1 className="orbitron text-xl text-[var(--cyan)] tracking-wider">SENTINEL</h1>
            <p className="text-[10px] text-[var(--muted)] tracking-widest">AI PREDICTIVE MAINTENANCE v2.0</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 mb-1 transition-all text-sm tracking-wider ${
              currentView === item.id
                ? 'text-[var(--cyan)] border-l-2 border-[var(--cyan)] bg-[var(--cyan)]/10'
                : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium orbitron">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-[var(--muted)]">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon)] animate-pulse"></div>
            <span className="text-xs mono text-[var(--muted)]">System Online</span>
          </div>
          <div className="text-xs mono text-[var(--muted)]">
            WebSocket: Connected
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
