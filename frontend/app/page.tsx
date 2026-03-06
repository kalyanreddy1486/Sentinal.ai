'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import SentinelHeader from '@/components/sentinel/SentinelHeader'
import CenterColumn from '@/components/sentinel/CenterColumn'
import RightColumn from '@/components/sentinel/RightColumn'
import { ToastContainer } from '@/components/sentinel/Toast'
import type { Machine, Alert, MaintenanceItem, StressConfig, Mechanic, NotificationLog, Toast as ToastType } from '@/lib/sentinel-types'
import { INITIAL_MACHINES, simulateMachine, applyStressValues, computeHealth, computeFailureProbability, computeTTF, computeStatus } from '@/lib/sentinel-simulation'
import { ENDPOINTS, fetchApi } from '@/lib/api-config'

// Dynamic import LeftColumn to avoid SSR issues with modal
const LeftColumn = dynamic(() => import('@/components/sentinel/LeftColumn'), { ssr: false })

const DEFAULT_STRESS: StressConfig = {
  active: false,
  auto: false,
  temperature: 80,
  vibration: 3,
  rpm: 2500,
  pressure: 70,
}

const INITIAL_ALERTS: Alert[] = [
  { id: 'a1', level: 'critical', machine: 'Pump Gamma',      message: 'Vibration exceeds 6.0 mm/s — bearing failure imminent', timestamp: '09:41:22' },
  { id: 'a2', level: 'critical', machine: 'Pump Gamma',      message: 'Temperature 104°C — thermal runaway risk detected',      timestamp: '09:40:07' },
  { id: 'a3', level: 'warning',  machine: 'Compressor Beta', message: 'Pressure trending toward max threshold (105/100 bar)',    timestamp: '09:38:50' },
  { id: 'a4', level: 'warning',  machine: 'Compressor Beta', message: 'Vibration elevated — schedule inspection within 48h',    timestamp: '09:35:12' },
]

const INITIAL_MAINTENANCE: MaintenanceItem[] = [
  { id: 'm1', machine: 'Pump Gamma',      action: 'Emergency bearing replacement + seal inspection', scheduledTime: 'TODAY — ASAP',       estimatedSavings: '$180K', priority: 'critical' },
  { id: 'm2', machine: 'Compressor Beta', action: 'Pressure valve calibration + vibration dampener',  scheduledTime: 'Within 48 hours',   estimatedSavings: '$45K',  priority: 'warning' },
  { id: 'm3', machine: 'Turbine Alpha',   action: 'Scheduled oil change + filter replacement',        scheduledTime: 'In 14 days',         estimatedSavings: '$12K',  priority: 'ok' },
]

let alertIdCounter = 100

export default function SentinelDashboard() {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES)
  const [selectedId, setSelectedId] = useState<string>(INITIAL_MACHINES[2].id)
  const [stress, setStress] = useState<StressConfig>(DEFAULT_STRESS)
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE)
  const [mechanics, setMechanics] = useState<Mechanic[]>([
    {
      id: 'mech-1',
      name: 'John Smith',
      email: 'john.smith@facility.com',
      phone: '+1 (555) 123-4567',
      assignedMachine: 'Pump Gamma',
      shift: 'morning',
      status: 'available',
    },
    {
      id: 'mech-2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@facility.com',
      phone: '+1 (555) 234-5678',
      assignedMachine: 'Compressor Beta',
      shift: 'evening',
      status: 'on-duty',
    },
  ])
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([])
  const [toasts, setToasts] = useState<ToastType[]>([])
  const stressRef = useRef(stress)
  stressRef.current = stress
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId

  // ─── Fetch real data from backend ────────────────────────────────
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const data = await fetchApi(ENDPOINTS.machines)
        if (data.machines && data.machines.length > 0) {
          // Map backend machines to frontend format
          const mappedMachines: Machine[] = data.machines.map((m: any) => ({
            id: m.machine_id,
            name: m.name,
            type: m.type,
            location: m.location || 'Unknown',
            status: m.status === 'critical' ? 'critical' : m.status === 'warning' ? 'warning' : 'normal',
            normalRanges: m.normal_ranges || {
              temperature: { min: 60, max: 95 },
              vibration: { min: 0.5, max: 4.0 },
              rpm: { min: 1300, max: 1700 },
              pressure: { min: 85, max: 105 }
            },
            sensorData: {
              temperature: m.latest_reading?.sensor_values?.temperature_c || 75,
              vibration: m.latest_reading?.sensor_values?.vibration_mm_s || 2.0,
              rpm: m.latest_reading?.sensor_values?.rpm || 1480,
              pressure: m.latest_reading?.sensor_values?.pressure_bar || 95,
              health: m.health || 85,
              failureProbability: m.failure_probability || 15,
              timeToFailure: m.time_to_failure || '> 30 days'
            },
            history: []
          }))
          setMachines(mappedMachines)
        }
      } catch (error) {
        console.log('Using simulated data - backend not available')
      }
    }

    fetchMachines()
    const interval = setInterval(fetchMachines, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  // ─── Fetch alerts from backend ───────────────────────────────────
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await fetchApi(ENDPOINTS.alerts)
        if (data.alerts) {
          const mappedAlerts: Alert[] = data.alerts.map((a: any) => ({
            id: a.alert_id,
            level: a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info',
            machine: a.machine_id,
            message: a.failure_type,
            timestamp: new Date(a.created_at).toLocaleTimeString('en-US', { hour12: false })
          }))
          setAlerts(mappedAlerts)
        }
      } catch (error) {
        console.log('Using initial alerts - backend not available')
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  // ─── Auto-generate alerts when failure probability crosses 70% ──
  useEffect(() => {
    machines.forEach(m => {
      if (m.sensorData.failureProbability > 70 && m.status === 'critical') {
        const now = new Date()
        const ts = now.toLocaleTimeString('en-US', { hour12: false })
        
        // Find assigned mechanic
        const assignedMechanic = mechanics.find(mech => mech.assignedMachine === m.name)
        
        const newAlert: Alert = {
          id: `auto-${++alertIdCounter}`,
          level: 'critical',
          machine: m.name,
          message: `Failure probability at ${m.sensorData.failureProbability.toFixed(0)}% — immediate action required`,
          timestamp: ts,
        }
        
        setAlerts(prev => {
          // Deduplicate recent auto-alerts for this machine
          const recent = prev.filter(a => a.id.startsWith('auto-') && a.machine === m.name)
          if (recent.length > 0 && Date.now() - parseInt(recent[0].id.split('-')[1] || '0') < 10000) return prev
          return [newAlert, ...prev.slice(0, 19)]
        })

        // Auto-send alert to mechanic and create notification log
        if (assignedMechanic) {
          const notificationId = `notif-${Date.now()}`
          setNotificationLogs(prev => [
            {
              id: notificationId,
              timeSent: ts,
              channel: 'email',
              mechanicName: assignedMechanic.name,
              machineName: m.name,
              status: 'sent',
              escalationTimer: 30 * 60 * 1000, // 30 minutes in milliseconds
            },
            ...prev.slice(0, 9),
          ])

          // Show toast notification
          setToasts(prev => [
            {
              id: `toast-${Date.now()}`,
              type: 'critical',
              message: `🚨 Alert sent to ${assignedMechanic.name} for ${m.name}`,
              mechanicName: assignedMechanic.name,
              machineName: m.name,
            },
            ...prev.slice(0, 4),
          ])
        }
      }
    })
  }, [machines, mechanics])

  const handleAddMachine = useCallback((newMachineData: Omit<Machine, 'id' | 'sensorData' | 'history'>) => {
    const nr = newMachineData.normalRanges
    const base = {
      temperature: (nr.temperature.min + nr.temperature.max) / 2,
      vibration:   (nr.vibration.min   + nr.vibration.max)   / 2,
      rpm:          (nr.rpm.min         + nr.rpm.max)          / 2,
      pressure:    (nr.pressure.min    + nr.pressure.max)    / 2,
    }
    const health = computeHealth(base, nr)
    const fp = computeFailureProbability(health)
    const newMachine: Machine = {
      ...newMachineData,
      id: `machine-${Date.now()}`,
      status: computeStatus(health),
      sensorData: { ...base, health, failureProbability: fp, timeToFailure: computeTTF(fp) },
      history: [],
    }
    setMachines(prev => [...prev, newMachine])
  }, [])

  const handleStressReset = useCallback(() => {
    setStress(DEFAULT_STRESS)
  }, [])

  const handleAddMechanic = useCallback((newMechanic: Omit<Mechanic, 'id'>) => {
    const mechanic: Mechanic = {
      ...newMechanic,
      id: `mech-${Date.now()}`,
    }
    setMechanics(prev => [...prev, mechanic])
  }, [])

  const handleDeleteMechanic = useCallback((id: string) => {
    setMechanics(prev => prev.filter(m => m.id !== id))
  }, [])

  const selectedMachine = machines.find(m => m.id === selectedId) || machines[0]
  const criticalCount = alerts.filter(a => a.level === 'critical').length
  const uptime = 99.2

  // ─── Apply stress test values to selected machine ────────────────
  useEffect(() => {
    if (!stress.active || !selectedMachine) return
    
    // Update the selected machine with stress test values
    setMachines(prev => prev.map(m => {
      if (m.id !== selectedId) return m
      
      // Calculate new health based on stress values
      const tempRatio = stress.temperature / 130 // max temp
      const vibRatio = stress.vibration / 8 // max vibration
      const rpmRatio = Math.abs(stress.rpm - 3000) / 2000 // deviation from normal
      
      const health = Math.max(10, 100 - (tempRatio * 30 + vibRatio * 40 + rpmRatio * 10))
      const failureProbability = Math.min(100, 100 - health + Math.random() * 10)
      const status = health < 40 ? 'critical' : health < 70 ? 'warning' : 'normal'
      
      return {
        ...m,
        status,
        sensorData: {
          ...m.sensorData,
          temperature: stress.temperature,
          vibration: stress.vibration,
          rpm: stress.rpm,
          pressure: stress.pressure || m.sensorData.pressure,
          health,
          failureProbability,
          timeToFailure: failureProbability > 80 ? '< 2 hours' : 
                        failureProbability > 60 ? '< 8 hours' :
                        failureProbability > 40 ? '< 24 hours' : '> 30 days'
        }
      }
    }))
    
    // Trigger alert if critical
    if (stress.temperature > 110 || stress.vibration > 6) {
      const now = new Date()
      const ts = now.toLocaleTimeString('en-US', { hour12: false })
      
      const newAlert: Alert = {
        id: `stress-${Date.now()}`,
        level: 'critical',
        machine: selectedMachine.name,
        message: `STRESS TEST: ${stress.temperature > 110 ? 'Overheating' : ''} ${stress.vibration > 6 ? 'Excessive vibration' : ''} detected`,
        timestamp: ts,
      }
      
      setAlerts(prev => {
        // Don't duplicate recent stress alerts
        const recent = prev.filter(a => a.id.startsWith('stress-') && a.machine === selectedMachine.name)
        if (recent.length > 0) return prev
        return [newAlert, ...prev.slice(0, 19)]
      })
      
      // Show toast
      setToasts(prev => [{
        id: `toast-${Date.now()}`,
        type: 'critical',
        message: `🚨 Stress test alert: ${selectedMachine.name} - Critical thresholds exceeded!`,
      }, ...prev.slice(0, 4)])
    }
  }, [stress.active, stress.temperature, stress.vibration, stress.rpm, stress.pressure, selectedId, selectedMachine])

  return (
    <div className="scanline-overlay grid-bg min-h-screen flex flex-col bg-[#060b18] overflow-hidden text-sm">
      <ToastContainer
        toasts={toasts}
        onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
      <SentinelHeader
        criticalCount={criticalCount}
        uptime={uptime}
        machineCount={machines.length}
      />

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden border-t border-[#1a2a45] max-w-[100vw]">
        <LeftColumn
          machines={machines}
          selectedId={selectedId}
          onSelect={setSelectedId}
          stress={stress}
          onStressChange={setStress}
          onStressReset={handleStressReset}
          onAddMachine={handleAddMachine}
        />

        {/* Divider */}
        <div className="w-px bg-[#1a2a45] shrink-0" />

        <CenterColumn machine={selectedMachine} />

        {/* Divider */}
        <div className="w-px bg-[#1a2a45] shrink-0" />

        <RightColumn
          machine={selectedMachine}
          machines={machines}
          alerts={alerts}
          maintenance={maintenance}
          mechanics={mechanics}
          notificationLogs={notificationLogs}
          onAddMechanic={handleAddMechanic}
          onDeleteMechanic={handleDeleteMechanic}
        />
      </div>
    </div>
  )
}
