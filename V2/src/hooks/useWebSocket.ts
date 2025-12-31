import { useEffect, useRef, useState, useCallback } from 'react';
import { SystemData } from '../types/system';

interface WebSocketMessage {
  type: string;
  data?: unknown;
  id?: string;
}

export function useWebSocket(serverUrl: string, token: string | null) {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageHandlersRef = useRef<Map<string, (data: unknown) => void>>(new Map());

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(`${serverUrl}/ws?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        ws.send(JSON.stringify({ type: 'system:subscribe' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'system:data') {
            setSystemData(message.data as SystemData);
          } else if (message.type === 'terminal:ready') {
            setTerminalReady(true);
          } else if (message.type === 'terminal:data') {
            const handler = messageHandlersRef.current.get('terminal:data');
            if (handler) {
              handler(message.data);
            }
          } else if (message.type === 'terminal:exit') {
            setTerminalReady(false);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setTerminalReady(false);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [serverUrl, token]);

  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, connect]);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const createTerminal = useCallback((cols: number, rows: number) => {
    sendMessage({ type: 'terminal:create', cols, rows });
  }, [sendMessage]);

  const sendTerminalInput = useCallback((data: string) => {
    sendMessage({ type: 'terminal:input', data });
  }, [sendMessage]);

  const resizeTerminal = useCallback((cols: number, rows: number) => {
    sendMessage({ type: 'terminal:resize', cols, rows });
  }, [sendMessage]);

  const onTerminalData = useCallback((handler: (data: string) => void) => {
    messageHandlersRef.current.set('terminal:data', handler);
  }, []);

  return {
    systemData,
    isConnected,
    terminalReady,
    createTerminal,
    sendTerminalInput,
    resizeTerminal,
    onTerminalData
  };
}
