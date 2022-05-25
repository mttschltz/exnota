import {ProtocolWithReturn} from 'webext-bridge';
import type {GetTokenResponse, SetTokenResponse} from './notionTypes';

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'notion.getToken': ProtocolWithReturn<undefined, GetTokenResponse>;
    'notion.setToken': ProtocolWithReturn<{token: string}, SetTokenResponse>;
  }
}
