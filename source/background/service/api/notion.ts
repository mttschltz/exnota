import {onMessage, sendMessage} from 'webext-bridge';
import {createLog} from '../../../lib/log';
import {resultError, resultOk, serializeResult} from '../../../lib/result';
import {validateToken} from '../notion/notion';
import {newGetTokenInteractor, GetTokenRepo} from '../../usecase/getToken';
import {newSetTokenInteractor, SetTokenRepo} from '../../usecase/setToken';
import {GetTokenResponse, SetTokenResponse} from './notionTypes';

const startGetTokenListener = (repo: GetTokenRepo): void => {
  const log = createLog('background', 'GetTokenMessageListener');

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

const getToken = async (): Promise<GetTokenResponse> => {
  const log = createLog('background', 'GetTokenMessageSender');

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
  const log = createLog('background', 'SetTokenMessageListener');

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

const setToken = async (token: string): Promise<SetTokenResponse> => {
  const log = createLog('background', 'SetTokenMessageSender');

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

export {getToken, setToken, startGetTokenListener, startSetTokenListener};
