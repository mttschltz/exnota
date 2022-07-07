import {FunctionResultValue, Result} from '@lib/result';
import type {FunctionResultError} from '@lib/result';
import {ConnectInteractor, ConnectResponse} from '@background/usecase/connect';
import {SetPageInteractor} from '@background/usecase/setPage';

type MessagingError = 'messaging-error';

type AuthGetClientIdMessageResponse = Result<string, 'fetching-client-id'>;

type AuthConnectMessageResponse = Result<
  ConnectResponse,
  FunctionResultError<ConnectInteractor['connect']> | MessagingError
>;

type OptionsSetPageMessageResponse = Result<
  FunctionResultValue<SetPageInteractor['setPage']>,
  FunctionResultError<SetPageInteractor['setPage']> | MessagingError
>;

export type {
  AuthConnectMessageResponse,
  AuthGetClientIdMessageResponse,
  MessagingError,
  OptionsSetPageMessageResponse,
};
