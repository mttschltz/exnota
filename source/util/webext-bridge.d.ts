import {ProtocolWithReturn} from 'webext-bridge';
import {MessageResponse} from './webext-bridge-shared';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'setup.validate-notion-integration-token': ProtocolWithReturn<
      {token: string},
      MessageResponse
    >;
  }
}
