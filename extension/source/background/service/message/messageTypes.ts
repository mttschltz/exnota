import {Errors, ResultValue, Result} from '@lib/result';
import {ConnectInteractor, ConnectResponse} from '@background/usecase/connect';
import {SetPageInteractor} from '@background/usecase/setPage';

type MessagingError = 'messaging-error';

type AuthGetClientIdMessageResponse = Result<string, 'fetching-client-id'>;

type AuthConnectMessageResponse = Result<
  ConnectResponse,
  Errors<ConnectInteractor['connect'], MessagingError>
>;

type OptionsSetPageMessageResponse = Result<
  ResultValue<SetPageInteractor['setPage']>,
  Errors<SetPageInteractor['setPage'], MessagingError>
>;

export type {
  AuthConnectMessageResponse,
  AuthGetClientIdMessageResponse,
  MessagingError,
  OptionsSetPageMessageResponse,
};
