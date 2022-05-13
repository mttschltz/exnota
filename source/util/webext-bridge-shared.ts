type MessageResult = 'success' | 'network-error' | 'invalid-token';

interface MessageResponse {
  result: MessageResult;
}

export type {MessageResult, MessageResponse};
