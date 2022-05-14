import {onMessage, sendMessage} from 'webext-bridge';
import {validateToken} from '../background/api/notion';

let listened = false;

type MessageStatus =
  | 'success'
  | 'notion-invalid-token'
  | 'notion-rate-limit-error'
  | 'notion-request-error' // an error likely inside our control
  | 'notion-other-error' // an error likely outside our control
  | 'unknown-error';

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
export {listen, validateIntegrationToken};
