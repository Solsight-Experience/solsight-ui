import { CHAT_SOCKET_EVENTS } from '@/lib/constants';
import { SocketManager, EventHandler } from '@/lib/socket-client';
import { ChatResponseDto, SendChatMessageDto } from '@/types/dto';

export interface ChatStreamChunk {
  sessionId: string;
  chunk: string;
}

export class ChatSocketManager extends SocketManager {
  private static instance: ChatSocketManager;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ChatSocketManager();
    }
    return this.instance;
  }

  sendMessage(payload: SendChatMessageDto): void {
    this.emit(CHAT_SOCKET_EVENTS.SEND, payload);
  }

  onResponse(sessionId: string, handler: (data: ChatResponseDto) => void): void {
    this.on(CHAT_SOCKET_EVENTS.RESPONSE, handler, `response:${sessionId}`);
  }

  onStream(sessionId: string, handler: (chunk: ChatStreamChunk) => void): void {
    this.on(CHAT_SOCKET_EVENTS.STREAM, handler, `stream:${sessionId}`);
  }

  onComplete(sessionId: string, handler: () => void): void {
    this.on(CHAT_SOCKET_EVENTS.COMPLETE, handler, `complete:${sessionId}`);
  }

  onError(sessionId: string, handler: (err: { code: string; message: string }) => void): void {
    this.on(CHAT_SOCKET_EVENTS.ERROR, handler, `error:${sessionId}`);
  }

  offSession(sessionId: string): void {
    this.offKey(`response:${sessionId}`);
    this.offKey(`stream:${sessionId}`);
    this.offKey(`complete:${sessionId}`);
    this.offKey(`error:${sessionId}`);
  }
}
