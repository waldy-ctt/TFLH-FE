type EventHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: number | null = null;
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  connect(userId: number) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.userId = userId;
    this.ws = new WebSocket(`ws://localhost:3000/ws?user_id=${userId}`);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      
      // Start ping interval to keep connection alive
      this.pingInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000); // Ping every 30 seconds
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle pong response
        if (data.type === "pong") {
          return;
        }

        // Emit event to all registered handlers
        const handlers = this.eventHandlers.get(data.type);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }

        // Also emit to "all" handlers
        const allHandlers = this.eventHandlers.get("*");
        if (allHandlers) {
          allHandlers.forEach((handler) => handler(data));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      this.cleanup();
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  on(eventType: string, handler: EventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  off(eventType: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    if (!this.userId) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }
}

export const wsService = new WebSocketService();
