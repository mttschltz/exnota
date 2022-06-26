import {Result} from '@lib/result';
import type {FunctionError} from '@lib/result';
import {ConnectInteractor, ConnectResponse} from '@background/usecase/connect';

type MessagingError = 'messaging-error';

type  AuthGetClientIdMessageResponse = Result<string, 'fetching-client-id'>;

type AuthConnectMessageResponse = Result<
  ConnectResponse,
  FunctionError<ConnectInteractor['connect']> | MessagingError
>;

export type {
  AuthConnectMessageResponse,
  AuthGetClientIdMessageResponse,
  MessagingError,
};
