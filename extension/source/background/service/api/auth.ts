import {
  GetPagesNotionApiErrorResponse,
  getPagesNotionApiPath,
  GetPagesNotionApiSuccessResponse,
  GetTokenNotionApiErrorResponse,
  getTokenNotionApiPath,
  GetTokenNotionApiSuccessResponse,
} from '@api/service';
import {ConnectService} from '@background/usecase/connect';
import {createLog, isErrorish} from '@lib/log';
import {resultError, resultOk, serializeResult} from '@lib/result';
import {browser} from 'webextension-polyfill-ts';

const getPages: ConnectService['getPages'] = async () => {
  const log = createLog('background', 'GetPagesService');

  log.info('Calling notionGetPages: Start');
  try {
    const headers = new Headers();
    headers.append('X-App-Version', browser.runtime.getManifest().version);

    const response = await fetch(getPagesNotionApiPath(), {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      headers,
    });
    if (response.ok) {
      log.info('Calling notionGetPages: Finish - ok response');
      const body: GetPagesNotionApiSuccessResponse = await response.json();
      return serializeResult(resultOk(body.pages));
    }

    log.info('Calling notionGetPages: Finish - not ok response');
    try {
      // response.json() will throw a syntax error if the body isn't valid JSON, which at time
      // of writing happens if the function service is down.
      const body: GetPagesNotionApiErrorResponse = await response.json();
      return serializeResult(
        resultError(
          `Error getting pages: ${body?.error} (${response.statusText} - ${response.status})`,
          'error-getting-pages',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
          }
        )
      );
    } catch {
      return serializeResult(
        resultError(
          `Error getting pages: ${response.statusText} - ${response.status}`,
          'error-getting-pages',
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
      log.info('Calling notionGetPages: Error');
      return serializeResult(resultError(e.name, 'error-getting-pages'));
    }
    log.info('Calling notionGetPages: Error');
    return serializeResult(
      resultError('Error fetching client ID', 'error-getting-pages')
    );
  }
};

const getToken: ConnectService['getToken'] = async (code, redirectURL) => {
  const log = createLog('background', 'GetTokenService');

  log.info('Calling notionGetToken: Start');
  try {
    const headers = new Headers();
    headers.append('X-App-Version', browser.runtime.getManifest().version);

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

export {getPages, getToken};
