import {ProtocolWithReturn} from 'webext-bridge';
import type {
  AuthGetClientIdMessageResponse,
  AuthConnectMessageResponse,
  OptionsSetPageMessageResponse,
} from './messageTypes';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'auth.getClientId': ProtocolWithReturn<
      undefined,
      AuthGetClientIdMessageResponse
    >;
    'auth.connect': ProtocolWithReturn<
      {code: string; redirectURL: string},
      AuthConnectMessageResponse
    >;
    'options.setPage': ProtocolWithReturn<
      {id: string; title: string; url: string},
      OptionsSetPageMessageResponse
    >;
  }
}
