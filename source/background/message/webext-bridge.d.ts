import {ProtocolWithReturn} from 'webext-bridge';
import {MessageStatus} from './notion';
import type { GetTokenInteractor, GetTokenError } from '../usecase/getToken'
import type { SetTokenInteractor, SetTokenError } from '../usecase/setToken'
import { Result } from '../../util/result'
import type { FunctionError } from '../../util/result'

// TODO: Remove
interface MessageResponse {
  result: ApiStatus;
}

type MessagingError = 'messaging-error'

type GetTokenResponse = Result<string | undefined, FunctionError<GetTokenInteractor['getToken']> | MessagingError>

type SetTokenResponse = Result<undefined, FunctionError<SetTokenInteractor['setToken']> | MessagingError>

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
    'notion.setToken': ProtocolWithReturn<
      {token: string},
      SetTokenResponse
    >;
  }
}
