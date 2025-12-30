export type MessageDirection = 'incoming' | 'outgoing';

export interface ChatMessage {
  id: string;
  direction: MessageDirection;
  phone: string;
  text: string;
  timestamp: number;
  status?: string;
  metadata?: Record<string, unknown>;
}
