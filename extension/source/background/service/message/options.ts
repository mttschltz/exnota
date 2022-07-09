import {onMessage, sendMessage} from 'webext-bridge';
import {createLog, isErrorish} from '@lib/log';
import {isResultError, resultError, serializeResult} from '@lib/result';
import {newSetPageInteractor, SetPageRepo} from '@background/usecase/setPage';
import {MessagingError, OptionsSetPageMessageResponse} from './messageTypes';

const startSetPageListener = (repo: SetPageRepo): void => {
  const log = createLog('background', 'OptionsSetPageMessageListener');
  log.info('Creating listener: Start');

  const interactor = newSetPageInteractor(repo);

  onMessage('options.setPage', async ({data}) => {
    log.info('Calling set page interactor: Start');
    const result = await interactor.setPage({
      id: data.id,
      title: data.title,
      url: data.url,
    });
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
  title: string,
  url: string
): Promise<OptionsSetPageMessageResponse> => {
  const log = createLog('background', 'OptionsSetPageMessageSender');

  try {
    log.info('Sending message: Start');
    const value = await sendMessage(
      'options.setPage',
      {id, title, url},
      'background'
    );
    log.info('Sending message: Finish');
    return value;
  } catch (e) {
    if (isErrorish(e)) {
      const err = resultError<undefined, MessagingError>(
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

export {startSetPageListener, setPage};
