import {onMessage, sendMessage} from 'webext-bridge';
import { createLog } from '../../util/log';
import { resultError, resultOk, serializeResult } from '../../util/result';
import {validateToken} from '../api/notion';
import { newGetTokenInteractor, GetTokenRepo } from '../usecase/getToken';
import { newSetTokenInteractor, SetTokenRepo } from '../usecase/setToken';
import { GetTokenResponse, SetTokenResponse } from './webext-bridge';

let listened = false;

type MessageStatus =
  | 'success'
  | 'notion-invalid-token'
  | 'notion-rate-limit-error'
  | 'notion-request-error' // an error likely inside our control
  | 'notion-other-error' // an error likely outside our control
  | 'unknown-error';

const startGetTokenListener = (repo: GetTokenRepo): void => {
  const log = createLog('background', 'GetTokenMessageListener')

  log.info('Creating listener: Start')
  const interactor = newGetTokenInteractor(repo)
  
  onMessage('notion.getToken', async () => {
    log.info('Calling getToken interactor: Start')
    const result = await interactor.getToken()
    log.info('Calling getToken interactor: Finish')
    
    if (!result.ok) {
      log.error('Error result', result)
      return serializeResult(result)
    }
    return serializeResult(result)
  });
  
  log.info('Creating listener: Finish')
};

const getToken = async (): Promise<GetTokenResponse> => {
  const log = createLog('background', 'GetTokenMessageSender')

  try {
    log.info('Sending message: Start')
    const value = await sendMessage(
      'notion.getToken',
      {},
      'background'
      );
    log.info('Sending message: Finish')
    return value;
  } catch {
    log.info('Sending message: Error')
    return resultError('Error sending message', 'messaging-error');
  }
}

const startSetTokenListener = (repo: SetTokenRepo): void => {
  const log = createLog('background', 'SetTokenMessageListener')

  log.info('Creating listener: Start')
  const interactor = newSetTokenInteractor(repo)
  
  onMessage('notion.setToken', async ({ data }) => {
    log.info('Calling setToken interactor: Start')
    const result = await interactor.setToken(data.token)
    log.info('Calling setToken interactor: Finish')
    
    if (!result.ok) {
      log.error('Error result', result)
      return serializeResult(result)
    }
    return serializeResult(resultOk(undefined))
  });
  
  log.info('Creating listener: Finish')
};

const setToken = async (token: string): Promise<SetTokenResponse> => {
  const log = createLog('background', 'SetTokenMessageSender')

  try {
    log.info('Sending message: Start')
    const value = await sendMessage(
      'notion.setToken',
      {token},
      'background'
      );
    log.info('Sending message: Finish')
    return value;
  } catch {
    log.info('Sending message: Error')
    return resultError('Error sending message', 'messaging-error');
  }
}

// TODO: Remove and add logging in new location
const listen = (): void => {
  if (listened) {
    throw new Error('Already listening for Notion messages');
  }
  listened = true;

  onMessage('setup.validate-notion-integration-token', async ({data}) => {
    const result = await validateToken(data.token);
    
    return result;
  });
};

type NotionMessageResult = MessageStatus | 'messaging-error';

// TODO: Remove and add logging in new location
const validateIntegrationToken = async (
  token: string
): Promise<NotionMessageResult> => {
  try {
    const value = await sendMessage(
      'setup.validate-notion-integration-token',
      {token},
      'background'
    );
    return value.result;
  } catch {
    return 'messaging-error';
  }
};

export type {MessageStatus};
export {getToken, setToken, listen, startGetTokenListener, startSetTokenListener, validateIntegrationToken};
