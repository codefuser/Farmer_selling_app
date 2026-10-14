import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

interface RealtimeEvent {
  event: string;
  data: any;
  timestamp: string;
}

interface RealtimeContextType {
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  lastEvent: null,
  subscribe: () => () => {},
});

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('kisandirect_token');
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  // Map of eventType -> Set of callback functions
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const notifyListeners = useCallback((eventType: string, data: any) => {
    const callbacks = listenersRef.current.get(eventType);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in realtime subscriber callback for ${eventType}:`, err);
        }
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const apiBase = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
      : '/api';

    const authToken = token || 'guest';
    const url = `${apiBase}/realtime/stream?token=${encodeURIComponent(authToken)}`;

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        // Retry after 5 seconds
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      // Built-in event listeners
      es.addEventListener('connected', () => {
        setIsConnected(true);
      });

      const registerEvent = (name: string) => {
        es.addEventListener(name, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            const eventItem: RealtimeEvent = {
              event: name,
              data,
              timestamp: new Date().toISOString(),
            };
            setLastEvent(eventItem);
            notifyListeners(name, data);
          } catch (err) {
            console.error(`Failed to parse ${name} event:`, err);
          }
        });
      };

      registerEvent('inventory_update');
      registerEvent('product_updated');
      registerEvent('product_added');
      registerEvent('product_deleted');
      registerEvent('submission_created');
      registerEvent('order_status_update');
      registerEvent('notification');

    } catch (err) {
      console.warn('EventSource initialization error:', err);
      setIsConnected(false);
    }
  }, [token, notifyListeners]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(callback);

    // Return un-subscribe function
    return () => {
      const set = listenersRef.current.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastEvent, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
