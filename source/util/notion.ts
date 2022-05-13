import {onMessage, sendMessage} from 'webext-bridge';
import {MessageResult} from './webext-bridge-shared';

let listened = false;

const listen = (): void => {
  if (listened) {
    throw new Error('Already listening for Notion messages');
  }
  listened = true;

  onMessage('setup.validate-notion-integration-token', ({data}) => {
    if (data.token === 'the only valid token') {
      return Promise.resolve({result: 'success' as const});
    }
    return Promise.resolve({result: 'network-error' as const});
  });
};

type NotionMessageResult = MessageResult | 'messaging-error';

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

export {listen, validateIntegrationToken};
