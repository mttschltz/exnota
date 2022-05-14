import {ProtocolWithReturn} from 'webext-bridge';
import {MessageStatus} from './notion';

interface MessageResponse {
  result: ApiStatus;
}

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'setup.validate-notion-integration-token': ProtocolWithReturn<
      {token: string},
      MessageResponse
    >;
  }
}
