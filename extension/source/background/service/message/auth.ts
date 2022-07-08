import {onMessage, sendMessage} from 'webext-bridge';
import {createLog, isErrorish} from '@lib/log';
import {
  isResultError,
  resultError,
  resultOk,
  serializeResult,
} from '@lib/result';
import {
  GetClientIdNotionApiResponse,
  getClientIdNotionApiPath,
} from '@api/service';
import {
  ConnectRepo,
  ConnectResponse,
  newConnectInteractor,
} from '@background/usecase/connect';
import {getPages, getToken} from '@background/service/api/auth';
import {
  AuthConnectMessageResponse,
  AuthGetClientIdMessageResponse,
  MessagingError,
} from './messageTypes';

const startConnectListener = (repo: ConnectRepo): void => {
  const log = createLog('background', 'AuthConnectMessageListener');
  log.info('Creating listener: Start');

  const interactor = newConnectInteractor(repo, {
    getPages,
    getToken,
  });

  onMessage('auth.connect', async ({data}) => {
    log.info('Calling connect interactor: Start');
    const result = await interactor.connect(data.code, data.redirectURL);
    log.info('Calling connect interactor: Finish');

    if (!result.ok) {
      log.error('Error result', result);
      return serializeResult(result);
    }
    return serializeResult(result);
  });

  log.info('Creating listener: Finish');
};

const connect = async (
  code: string,
  redirectURL: string
): Promise<AuthConnectMessageResponse> => {
  const log = createLog('background', 'AuthConnectMessageSender');

  try {
    log.info('Sending message: Start');
    const value = await sendMessage(
      'auth.connect',
      {code, redirectURL},
      'background'
    );
    log.info('Sending message: Finish');
    return value;
  } catch (e) {
    if (isErrorish(e)) {
      const err = resultError<ConnectResponse, MessagingError>(
        e.name,
        'messaging-error',
        e
      );
      log.error('Sending message: Error', isResultError(err) ? err : undefined);
      return err;
    }
    log.error('Sending message: Error');
    return resultError('Sending message: Error', 'messaging-error');
  }
};

const startGetClientIdListener = (): void => {
  const log = createLog('background', 'AuthGetClientIdMessageListener');

  onMessage('auth.getClientId', async () => {
    log.info('Calling notionClientId: Start');
    try {
      const response = await fetch(getClientIdNotionApiPath(), {
        method: 'GET',
        mode: 'same-origin',
        credentials: 'same-origin',
      });
      if (response.ok) {
        log.info('Calling notionClientId: Finish - ok response');
        const body: GetClientIdNotionApiResponse = await response.json();
        return serializeResult(resultOk(body.clientId));
      }
      log.info('Calling notionClientId: Finish - not ok response');
      return serializeResult(
        resultError(
          'Error fetching client ID',
          'fetching-client-id',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
          }
        )
      );
    } catch (e) {
      if (isErrorish(e)) {
        const err = resultError<string, 'fetching-client-id'>(
          e.name,
          'fetching-client-id',
          e
        );
        log.error(
          'Calling notionClientId: Error',
          isResultError(err) ? err : undefined
        );
        return serializeResult(err);
      }
      log.error('Calling notionClientId: Error');
      return serializeResult(
        resultError('Error fetching client ID', 'fetching-client-id')
      );
    }
  });
};

const getClientId = async (): Promise<AuthGetClientIdMessageResponse> => {
  const log = createLog('background', 'AuthGetClientIdMessageSender');

  try {
    log.info('Sending message: Start');
    const value = await sendMessage(
      'auth.getClientId',
      undefined,
      'background'
    );
    log.info('Sending message: Finish');
    return value;
  } catch (e) {
    if (isErrorish(e)) {
      const err = resultError<string, MessagingError>(
        e.name,
        'messaging-error',
        e
      );
      log.error('Sending message: Error', isResultError(err) ? err : undefined);
      return err;
    }
    log.error('Sending message: Error');
    return resultError('Sending message: Error', 'messaging-error');
  }
};

export {startConnectListener, connect, getClientId, startGetClientIdListener};
