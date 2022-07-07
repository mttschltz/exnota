import {onMessage, sendMessage} from 'webext-bridge';
import {createLog} from '@lib/log';
import {resultError, serializeResult} from '@lib/result';
import {newSetPageInteractor, SetPageRepo} from '@background/usecase/setPage';
import {OptionsSetPageMessageResponse} from './messageTypes';

const startSetPageListener = (repo: SetPageRepo): void => {
  const log = createLog('background', 'OptionsSetPageMessageListener');
  log.info('Creating listener: Start');

  const interactor = newSetPageInteractor(repo);

  onMessage('options.setPage', async ({data}) => {
    log.info('Calling set page interactor: Start');
    const result = await interactor.setPage(data.id, data.title);
    log.info('Calling set page interactor: Finish');

    if (!result.ok) {
      log.error('Error result', result);
      return serializeResult(result);
    }
    return serializeResult(result);
  });

  log.info('Creating listener: Finish');
};

const setPage = async (
  id: string,
  title: string
): Promise<OptionsSetPageMessageResponse> => {
  const log = createLog('background', 'OptionsSetPageMessageSender');

  try {
    log.info('Sending message: Start');
    const value = await sendMessage(
      'options.setPage',
      {id, title},
      'background'
    );
    log.info('Sending message: Finish');
    return value;
  } catch {
    log.info('Sending message: Error');
    return resultError(
      'Error sending message via OptionsSetPageMessageSender',
      'messaging-error'
    );
  }
};

export {startSetPageListener, setPage};
