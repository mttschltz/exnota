import {ProtocolWithReturn} from 'webext-bridge';
import {MessageStatus} from './notion';
import type { UseCaseOptionsError } from '../usecase/getToken'

// TODO: Remove
interface MessageResponse {
  result: ApiStatus;
}

type GetTokenResponse = { token?: string; status: 'success' } | { status: UseCaseOptionsError | 'messaging-error' }

declare module 'webext-bridge' {
  export interface ProtocolMap {
    'setup.validate-notion-integration-token': ProtocolWithReturn<
      {token: string},
      MessageResponse
    >;
    'notion.getToken': ProtocolWithReturn<
      {},
      GetTokenResponse
    >;
  }
}
