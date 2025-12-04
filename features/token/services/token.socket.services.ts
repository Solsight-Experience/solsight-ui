import { SocketManager, EventHandler } from '@/lib/socket-client';
export class TokenSocketManager extends SocketManager {
  private static _instance: TokenSocketManager;
  private constructor() {
    super();
  }

  public static getInstance(): TokenSocketManager {
    if (!TokenSocketManager._instance) {
      TokenSocketManager._instance = new TokenSocketManager();
    }
    return TokenSocketManager._instance;
  }
  public onTokenEvent(token: string, event: string, handler: EventHandler) {
    this.connect();
    this.socket!.emit('subscribe', { token });

    const wrappedHandler = (payload: { token: string; data: any }) => {
      if (payload.token === token) handler(payload.data);
    };

    this.on(event, wrappedHandler, token);
  }

  public offTokenEvents(token: string): void {
    this.socket!.emit('unsubscribe', { token });
    this.offByKey(token);
  }

  public emitTokenEvent(token: string, event: string, data: any) {
    this.connect();
    this.socket!.emit(event, { token, data });
  }

  public disconnect(): void {
    for (const token in this.eventMap) {
      this.socket!.emit('unsubscribe', { token });
    }
    super.disconnect();
  }
}
