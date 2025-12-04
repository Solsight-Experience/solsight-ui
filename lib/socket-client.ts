import { io, Socket } from 'socket.io-client';

export type EventHandler = (...args: any[]) => void;

interface EventRecord {
  event: string;
  handler: EventHandler;
}

export class SocketManager {
  private static instance: SocketManager;
  protected socket: Socket | null = null;
  protected eventMap: Record<string, EventRecord[]> = {};

  protected constructor() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  protected getSocket(): Socket {
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

  public on(event: string, handler: EventHandler, key?: string) {
    this.connect();
    this.socket!.on(event, handler);

    if (key) {
      if (!this.eventMap[key]) this.eventMap[key] = [];
      this.eventMap[key].push({ event, handler });
    }
  }

  public off(event: string, handler: EventHandler) {
    this.socket!.off(event, handler);
  }

  public offByKey(key: string) {
    if (this.eventMap[key]) {
      this.eventMap[key].forEach(({ event, handler }) => {
        this.socket!.off(event, handler);
      });
      delete this.eventMap[key];
    }
  }

  public emit(event: string, data?: any) {
    this.connect();
    this.socket!.emit(event, data);
  }

  public disconnect(): void {
    for (const key in this.eventMap) {
      this.offByKey(key);
    }
    this.socket?.disconnect();
    this.eventMap = {};
  }
}