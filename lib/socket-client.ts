import { io, Socket } from 'socket.io-client';

type EventHandler = (...args: any[]) => void;
interface EventRecord {
  event: string;
  handler: EventHandler;
}

export class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private eventMap: Record<string, EventRecord[]> = {};

  private constructor() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  // Singleton instance
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        transports: ['websocket'],
        autoConnect: false,
      });
    }
    return this.socket;
  }

  public connect(): void {
    const socket = this.getSocket();
    if (!socket.connected) socket.connect();
  }

  public onTokenEvent(token: string, event: string, handler: EventHandler) {
    this.connect();
    this.socket!.emit('subscribe', { token });

    const wrappedHandler = (payload: { token: string; data: any }) => {
      if (payload.token === token) handler(payload.data);
    };

    this.socket!.on(event, wrappedHandler);

    if (!this.eventMap[token]) this.eventMap[token] = [];
    this.eventMap[token].push({ event, handler: wrappedHandler });
  }

  public offTokenEvents(token: string): void {
    this.socket!.emit('unsubscribe', { token });

    if (this.eventMap[token]) {
      this.eventMap[token].forEach(({ event, handler }) => {
        this.socket!.off(event, handler);
      });
      delete this.eventMap[token];
    }
  }

  public disconnect(): void {
    for (const token in this.eventMap) {
      this.offTokenEvents(token);
    }
    this.socket?.disconnect();
  }
}
