import {
  GetTokenNotionApiErrorResponse,
  getTokenNotionApiPath,
  GetTokenNotionApiSuccessResponse,
} from '@api/service';
import {ConnectService} from '@background/usecase/connect';
import {createLog, isErrorish} from '@lib/log';
import {resultError, resultOk, serializeResult} from '@lib/result';

const getToken: ConnectService['getToken'] = async (code, redirectURL) => {
  const log = createLog('background', 'GetTokenService');

  log.info('Calling notionGetToken: Start');
  try {
    const headers = new Headers();
    headers.append('X-App-Version', 'browser.runtime.getManifest().version');

    const response = await fetch(getTokenNotionApiPath(), {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      body: JSON.stringify({code, redirectURL}),
      headers,
    });
    if (response.ok) {
      log.info('Calling notionGetToken: Finish - ok response');
      const body: GetTokenNotionApiSuccessResponse = await response.json();
      return serializeResult(resultOk(body.tokenResponse));
    }

    log.info('Calling notionGetToken: Finish - not ok response');
    try {
      // response.json() will throw a syntax error if the body isn't valid JSON, which at time
      // of writing happens if the function service is down.
      const body: GetTokenNotionApiErrorResponse = await response.json();
      // notion-invalid-grant is expected if code is invalid
      return serializeResult(
        resultError(
          `Error fetching token: ${body?.error} (${response.statusText} - ${response.status})`,
          'error-getting-token',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
          }
        )
      );
    } catch {
      // notion-invalid-grant is expected if code is invalid
      return serializeResult(
        resultError(
          `Error fetching token: ${response.statusText} - ${response.status}`,
          'error-getting-token',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
          }
        )
      );
    }
  } catch (e) {
    if (isErrorish(e)) {
      log.info('Calling notionGetToken: Error');
      return serializeResult(resultError(e.name, 'error-getting-token'));
    }
    log.info('Calling notionGetToken: Error');
    return serializeResult(
      resultError('Error fetching client ID', 'error-getting-token')
    );
  }
};

export {getToken};
