import {ProtocolWithReturn} from 'webext-bridge';
import {MessageStatus} from './notion';
import type { GetTokenInteractor, UseCaseOptionsError } from '../usecase/getToken'
import { Result } from '../../util/result'
import type { GetRepoMethodError } from '../repo'

// TODO: Remove
interface MessageResponse {
  result: ApiStatus;
}

type MessagingError = 'messaging-error'

type GetTokenResponse = Result<string | undefined, GetRepoMethodError<GetTokenInteractor['getToken']> | MessagingError>

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
