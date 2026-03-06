import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children, currentView, setCurrentView }) {
  return (
    <div className="flex h-screen" style={{ background: 'var(--void)' }}>
      {/* Background Layers */}
      <div className="bg-layer bg-hex" />
      <div className="bg-layer bg-glow" />
      <div className="bg-layer bg-scanline" />
      
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 overflow-hidden mt-16" style={{ background: 'var(--void)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
