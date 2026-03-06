import React, { useState } from 'react'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Copilot from './pages/Copilot'
import StressLab from './pages/StressLab'
import Architecture from './pages/Architecture'
import TwinForge from './pages/TwinForge'
import ROIEngine from './pages/ROIEngine'
import WebSocketTest from './pages/WebSocketTest'
import Alerts from './pages/Alerts'
import Maintenance from './pages/Maintenance'
import NASAValidation from './pages/NASAValidation'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [copilotMachineId, setCopilotMachineId] = useState('C')

  const handleNavigate = (view, machineId = null) => {
    if (machineId) setCopilotMachineId(machineId)
    setCurrentView(view)
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'copilot':
        return <Copilot initialMachineId={copilotMachineId} />
      case 'stresslab':
        return <StressLab />
      case 'architecture':
        return <Architecture />
      case 'twinforge':
        return <TwinForge />
      case 'roiengine':
        return <ROIEngine />
      case 'websockettest':
        return <WebSocketTest />
      case 'alerts':
        return <Alerts />
      case 'maintenance':
        return <Maintenance />
      case 'nasavalidation':
        return <NASAValidation />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  )
}

export default App
