import {onMessage, sendMessage} from 'webext-bridge';
import {createLog, isErrorish} from '@lib/log';
import {resultError, resultOk, serializeResult} from '@lib/result';
import {validateToken} from '@background/service/notion/notion';
import {
  newGetTokenInteractor,
  GetTokenRepo,
} from '@background/usecase/getToken';
import {
  newSetTokenInteractor,
  SetTokenRepo,
} from '@background/usecase/setToken';
import {
  GetNotionClientIdApiResponse,
  notionClientIdApiPath,
} from '@api/service';
import {
  GetNotionClientIdMessageResponse,
  GetTokenMessageResponse,
  SetTokenMessageResponse,
} from './tokenTypes';

const startGetClientIdListener = (): void => {
  const log = createLog('background', 'NotionGetClientIdMessageListener');

  onMessage('notion.getClientId', async () => {
    log.info('Calling notionClientId: Start');
    try {
      const response = await fetch(notionClientIdApiPath(), {
        method: 'GET',
        mode: 'same-origin',
        credentials: 'same-origin',
      });
      if (response.ok) {
        log.info('Calling notionClientId: Finish - ok response');
        const body: GetNotionClientIdApiResponse = await response.json();
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
        log.info('Calling notionClientId: Error');
        return serializeResult(resultError(e.name, 'fetching-client-id'));
      }
      log.info('Calling notionClientId: Error');
      return serializeResult(
        resultError('Error fetching client ID', 'fetching-client-id')
      );
    }
  });
};

const getClientId = async (): Promise<GetNotionClientIdMessageResponse> => {
  const log = createLog('background', 'NotionGetClientIdMessageSender');

  try {
    log.info('Sending message: Start');
    const value = await sendMessage(
      'notion.getClientId',
      undefined,
      'background'
    );
    log.info('Sending message: Finish');
    return value;
  } catch {
    log.info('Sending message: Error');
    return resultError(
      'Error sending message via GetClientIdMessageSender',
      'fetching-client-id'
    );
  }
};

const startGetTokenListener = (repo: GetTokenRepo): void => {
  const log = createLog('background', 'NotionGetTokenMessageListener');

  log.info('Creating listener: Start');
  const interactor = newGetTokenInteractor(repo);

  onMessage('notion.getToken', async () => {
    log.info('Calling getToken interactor: Start');
    const result = await interactor.getToken();
    log.info('Calling getToken interactor: Finish');

    if (!result.ok) {
      log.error('Error result', result);
      return serializeResult(result);
    }
    return serializeResult(result);
  });

  log.info('Creating listener: Finish');
};

const getToken = async (): Promise<GetTokenMessageResponse> => {
  const log = createLog('background', 'NotionGetTokenMessageSender');

  try {
    log.info('Sending message: Start');
    const value = await sendMessage('notion.getToken', undefined, 'background');
    log.info('Sending message: Finish');
    return value;
  } catch {
    log.info('Sending message: Error');
    return resultError(
      'Error sending message via GetTokenMessageSender',
      'messaging-error'
    );
  }
};

const startSetTokenListener = (repo: SetTokenRepo): void => {
  const log = createLog('background', 'NotionSetTokenMessageListener');

  log.info('Creating listener: Start');
  const interactor = newSetTokenInteractor(repo, validateToken);

  onMessage('notion.setToken', async ({data}) => {
    log.info('Calling setToken interactor: Start');
    const result = await interactor.setToken(data.token);
    log.info('Calling setToken interactor: Finish');

    if (!result.ok) {
      log.error('Error result', result);
      return serializeResult(result);
    }
    return serializeResult(resultOk(undefined));
  });

  log.info('Creating listener: Finish');
};

const setToken = async (token: string): Promise<SetTokenMessageResponse> => {
  const log = createLog('background', 'NotionSetTokenMessageSender');

  try {
    log.info('Sending message: Start');
    const result = await sendMessage('notion.setToken', {token}, 'background');
    log.info('Sending message: Finish');
    return result;
  } catch {
    log.info('Sending message: Error');
    return resultError(
      'Error sending message via SetTokenMessageSender',
      'messaging-error'
    );
  }
};

export {
  getToken,
  setToken,
  getClientId,
  startGetClientIdListener,
  startGetTokenListener,
  startSetTokenListener,
};
