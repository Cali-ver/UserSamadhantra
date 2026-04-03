import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing WebSocket connections
 * @param {string} url - The WebSocket endpoint URL
 * @param {object} options - Connection options (onMessage, onOpen, onClose, onError)
 */
export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  const { onMessage, onOpen, onClose, onError } = options;

  const connect = useCallback(() => {
    if (!url) return;
    
    // Clear any existing connection
    if (ws.current) {
        ws.current.close();
    }

    console.log(`🔌 Connecting to WebSocket: ${url}`);
    
    ws.current = new WebSocket(url);

    ws.current.onopen = (event) => {
      setIsConnected(true);
      console.log('✅ WebSocket Connected');
      if (onOpen) onOpen(event);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
      if (onMessage) onMessage(data);
    };

    ws.current.onclose = (event) => {
      setIsConnected(false);
      console.log('❌ WebSocket Disconnected');
      if (onClose) onClose(event);
      
      // Auto-reconnect after 3 seconds
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
      if (onError) onError(error);
    };
  }, [url, onMessage, onOpen, onClose, onError]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket not connected. Message queued.');
    }
  }, []);

  return { isConnected, messages, sendMessage, setMessages };
};
