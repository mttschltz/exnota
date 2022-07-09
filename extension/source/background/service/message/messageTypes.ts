import {Errors, ResultValue, Result} from '@lib/result';
import {ConnectInteractor, ConnectResponse} from '@background/usecase/connect';
import {SetPageInteractor} from '@background/usecase/setPage';
import {VerifyPageInteractor} from '@background/usecase/verifyPage';

type MessagingError = 'messaging-error';

type AuthGetClientIdMessageResponse = Result<
  string,
  Errors<MessagingError, 'fetching-client-id'>
>;

type AuthConnectMessageResponse = Result<
  ConnectResponse,
  Errors<ConnectInteractor['connect'], MessagingError>
>;

type OptionsSetPageMessageResponse = Result<
  ResultValue<SetPageInteractor['setPage']>,
  Errors<SetPageInteractor['setPage'], MessagingError>
>;

type OptionsVerifyPageMessageResponse = Result<
  ResultValue<VerifyPageInteractor['verifyPage']>,
  Errors<VerifyPageInteractor['verifyPage'], MessagingError>
>;

export type {
  AuthConnectMessageResponse,
  AuthGetClientIdMessageResponse,
  MessagingError,
  OptionsSetPageMessageResponse,
  OptionsVerifyPageMessageResponse,
};
