import React, { useState, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function WebSocketTest() {
  const clientId = useMemo(() => 'test-client-' + Math.random().toString(36).substr(2, 9), []);
  const { isConnected, connectionError, messages, machineData, sendMessage, connect, disconnect } = useWebSocket(clientId);
  const [testResults, setTestResults] = useState([]);

  const sendAnomalyData = () => {
    const anomalyData = {
      action: 'test_anomaly',
      machine_id: 'A',
      timestamp: new Date().toISOString(),
      sensors: {
        temperature: 95.5,
        vibration: 4.8,
        rpm: 2850,
        pressure: 78.2
      },
      tier: {
        level: 2,
        label: 'TRENDING',
        consecutive_rises: 5,
        rising_metric: 'vibration'
      },
      health_score: 65.3,
      failure_probability: 35.8,
      alert: {
        type: 'ANOMALY_DETECTED',
        message: 'Vibration levels trending upward for 5 consecutive readings',
        confidence: 78
      }
    };
    
    sendMessage(anomalyData);
    setTestResults(prev => [...prev, { type: 'sent', data: anomalyData, time: new Date().toLocaleTimeString() }]);
  };

  const sendCriticalAlert = () => {
    const criticalData = {
      action: 'test_critical',
      machine_id: 'C',
      timestamp: new Date().toISOString(),
      sensors: {
        temperature: 105.2,
        vibration: 6.1,
        rpm: 2650,
        pressure: 72.5
      },
      tier: {
        level: 1,
        label: 'CRITICAL',
        consecutive_rises: 12,
        rising_metric: 'temperature'
      },
      health_score: 28.5,
      failure_probability: 87.3,
      alert: {
        type: 'CRITICAL_ALERT',
        message: 'Bearing failure predicted with 87% confidence',
        confidence: 87,
        estimated_time_to_failure: '8 minutes'
      }
    };
    
    sendMessage(criticalData);
    setTestResults(prev => [...prev, { type: 'sent', data: criticalData, time: new Date().toLocaleTimeString() }]);
  };

  const subscribeToMachine = (machineId) => {
    sendMessage({
      action: 'subscribe',
      machine_id: machineId
    });
    setTestResults(prev => [...prev, { type: 'subscribe', machineId, time: new Date().toLocaleTimeString() }]);
  };

  return (
    <div className="p-5 h-full overflow-y-auto">
      <h2 className="orbitron text-2xl mb-4 text-[var(--cyan)]">WEBSOCKET TEST</h2>
      
      {/* Connection Status */}
      <div className="glass-card p-4 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[var(--neon)] animate-pulse' : 'bg-[var(--red)]'}`}></span>
            <span className="mono text-sm">
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <button 
            className="cyber-btn text-xs"
            onClick={isConnected ? disconnect : connect}
          >
            {isConnected ? 'DISCONNECT' : 'CONNECT'}
          </button>
        </div>
        {connectionError && (
          <div className="mt-3 p-2 bg-[var(--red)]/20 border border-[var(--red)] text-[var(--red)] mono text-xs">
            Error: {connectionError}
          </div>
        )}
        <div className="mt-3 mono text-xs text-[var(--muted)]">
          Backend URL: ws://localhost:8000/ws
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <button 
          className="cyber-btn"
          onClick={() => subscribeToMachine('A')}
          disabled={!isConnected}
        >
          SUBSCRIBE MACHINE A
        </button>
        <button 
          className="cyber-btn"
          onClick={sendAnomalyData}
          disabled={!isConnected}
        >
          SEND ANOMALY DATA
        </button>
        <button 
          className="cyber-btn cyber-btn-red"
          onClick={sendCriticalAlert}
          disabled={!isConnected}
        >
          SEND CRITICAL ALERT
        </button>
      </div>

      {/* Live Machine Data */}
      <div className="glass-card p-4 mb-5">
        <h3 className="orbitron text-lg mb-3 text-[var(--amber)]">LIVE MACHINE DATA</h3>
        {Object.keys(machineData).length === 0 ? (
          <div className="mono text-sm text-[var(--muted)]">No data received yet...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(machineData).map(([id, data]) => (
              <div key={id} className="bg-[var(--deep)] p-3 border border-[var(--muted)]">
                <div className="orbitron text-sm mb-2">Machine {id}</div>
                <div className="mono text-xs space-y-1">
                  <div>Health: {data.health_score?.toFixed(1)}%</div>
                  <div>Failure Prob: {data.failure_probability?.toFixed(1)}%</div>
                  <div>Tier: {data.tier?.label}</div>
                  {data.sensors && (
                    <div className="mt-2 pt-2 border-t border-[var(--muted)]">
                      <div>Temp: {data.sensors.temperature?.toFixed(1)}°C</div>
                      <div>Vib: {data.sensors.vibration?.toFixed(2)} mm/s</div>
                      <div>RPM: {data.sensors.rpm}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Results Log */}
      <div className="glass-card p-4">
        <h3 className="orbitron text-lg mb-3 text-[var(--purple)]">TEST LOG</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="mono text-sm text-[var(--muted)]">No tests run yet...</div>
          ) : (
            testResults.map((result, idx) => (
              <div key={idx} className="mono text-xs p-2 bg-[var(--deep)] border-l-2 border-[var(--cyan)]">
                <span className="text-[var(--muted)]">[{result.time}]</span>
                <span className="ml-2 text-[var(--cyan)]">{result.type.toUpperCase()}</span>
                {result.machineId && <span className="ml-2">Machine {result.machineId}</span>}
                {result.data?.alert?.type && (
                  <div className="mt-1 text-[var(--red)]">
                    Alert: {result.data.alert.message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Raw Messages */}
      <div className="glass-card p-4 mt-5">
        <h3 className="orbitron text-lg mb-3 text-[var(--neon)]">RAW MESSAGES ({messages.length})</h3>
        <div className="max-h-[200px] overflow-y-auto mono text-xs">
          {messages.slice(-10).map((msg, idx) => (
            <pre key={idx} className="p-2 mb-1 bg-[var(--deep)] text-[var(--text)]">
              {JSON.stringify(msg, null, 2)}
            </pre>
          ))}
        </div>
      </div>
    </div>
  );
}
