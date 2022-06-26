import {ProtocolWithReturn} from 'webext-bridge';
import type {
  AuthGetClientIdMessageResponse,
  AuthConnectMessageResponse,
} from './authTypes';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'notion.getClientId': ProtocolWithReturn<
      undefined,
      AuthGetClientIdMessageResponse
    >;
    'notion.connect': ProtocolWithReturn<
      {code: string; redirectURL: string},
      AuthConnectMessageResponse
    >;
  }
}
