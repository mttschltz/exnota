import type {GetTokenInteractor} from '@background/usecase/getToken';
import type {SetTokenInteractor} from '@background/usecase/setToken';
import {Result} from '@lib/result';
import type {FunctionError} from '@lib/result';

type MessagingError = 'messaging-error';

type GetNotionClientIdMessageResponse = Result<string, 'fetching-client-id'>;

type GetTokenMessageResponse = Result<
  string | undefined,
  FunctionError<GetTokenInteractor['getToken']> | MessagingError
>;

type SetTokenMessageResponse = Result<
  undefined,
  FunctionError<SetTokenInteractor['setToken']> | MessagingError
>;

export type {
  GetTokenMessageResponse,
  GetNotionClientIdMessageResponse,
  SetTokenMessageResponse,
  MessagingError,
};
