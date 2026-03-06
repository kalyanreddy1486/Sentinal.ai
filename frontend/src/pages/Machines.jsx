import React from 'react'

const machines = [
  { id: 'PUMP_001', name: 'Pump Alpha', type: 'Centrifugal Pump', status: 'normal', health: 96 },
  { id: 'COMP_001', name: 'Compressor Beta', type: 'Air Compressor', status: 'normal', health: 92 },
  { id: 'PUMP_002', name: 'Pump Gamma', type: 'Boiler Feed Pump', status: 'normal', health: 88 },
  { id: 'MOTOR_001', name: 'Motor Delta', type: 'Electric Motor', status: 'trending', health: 76 },
]

function Machines() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Machines</h2>
        <button className="px-4 py-2 bg-[var(--primary)] text-black rounded-lg font-medium hover:bg-[var(--primary)]/80 transition-colors">
          + Add Machine
        </button>
      </div>
      
      <div className="glass-panel overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Machine</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Type</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Health</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine.id} className="border-t border-[var(--border)] hover:bg-white/5">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{machine.name}</p>
                    <p className="text-sm text-gray-400">{machine.id}</p>
                  </div>
                </td>
                <td className="p-4 text-gray-400">{machine.type}</td>
                <td className="p-4">
                  <StatusBadge status={machine.status} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getHealthColor(machine.health)}`}
                        style={{ width: `${machine.health}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{machine.health}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <button className="text-[var(--primary)] hover:underline text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    normal: 'bg-[var(--success)]/20 text-[var(--success)]',
    trending: 'bg-[var(--warning)]/20 text-[var(--warning)]',
    critical: 'bg-[var(--danger)]/20 text-[var(--danger)]'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function getHealthColor(health) {
  if (health >= 80) return 'bg-[var(--success)]'
  if (health >= 60) return 'bg-[var(--warning)]'
  return 'bg-[var(--danger)]'
}

export default Machines
