import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = 'ws://localhost:8000/ws';

export function useWebSocket(clientId) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [machineData, setMachineData] = useState({});
  const [connectionError, setConnectionError] = useState(null);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      setConnectionError(null);
      console.log(`Attempting WebSocket connection to ${WS_URL}/${clientId}`);
      
      ws.current = new WebSocket(`${WS_URL}/${clientId}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev.slice(-50), data]);
          
          // Store machine data if it contains sensor readings
          if (data.machine_id && data.sensors) {
            setMachineData(prev => ({
              ...prev,
              [data.machine_id]: data
            }));
          }
        } catch (e) {
          console.log('WebSocket message (raw):', event.data);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(3000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          reconnectTimeout.current = setTimeout(connect, delay);
        } else {
          setConnectionError('Max reconnection attempts reached');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed - check if backend is running');
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionError(error.message);
    }
  }, [clientId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  const sendMessage = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  const subscribeToMachine = useCallback((machineId) => {
    sendMessage({
      action: 'subscribe',
      machine_id: machineId
    });
  }, [sendMessage]);

  const unsubscribeFromMachine = useCallback((machineId) => {
    sendMessage({
      action: 'unsubscribe',
      machine_id: machineId
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    messages,
    machineData,
    sendMessage,
    subscribeToMachine,
    unsubscribeFromMachine,
    connect,
    disconnect
  };
}
