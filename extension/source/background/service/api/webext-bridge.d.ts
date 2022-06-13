import {ProtocolWithReturn} from 'webext-bridge';
import type {
  GetNotionClientIdMessageResponse,
  GetTokenMessageResponse,
  SetTokenMessageResponse,
} from './tokenTypes';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'notion.getClientId': ProtocolWithReturn<
      undefined,
      GetNotionClientIdMessageResponse
    >;
    'notion.getToken': ProtocolWithReturn<undefined, GetTokenMessageResponse>;
    'notion.setToken': ProtocolWithReturn<
      {token: string},
      SetTokenMessageResponse
    >;
  }
}
