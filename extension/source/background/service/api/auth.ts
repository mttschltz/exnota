import {
  GetPagesNotionApiErrorResponse,
  getPagesNotionApiPath,
  GetPagesNotionApiSuccessResponse,
  GetTokenNotionApiErrorResponse,
  getTokenNotionApiPath,
  GetTokenNotionApiSuccessResponse,
} from '@api/service';
import {GetPagesError, GetPagesService} from '@background/service';
import {ConnectService} from '@background/usecase/connect';
import {createLog, isErrorish} from '@lib/log';
import {resultError, resultOk, serializeResult} from '@lib/result';
import {browser} from 'webextension-polyfill-ts';

const getPages: GetPagesService = async () => {
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

      log.info('Calling notionGetPages: Finish - not ok response body', {
        ...body,
      });

      let errorMessage: string;
      let errorType: GetPagesError;
      // No default case so that we get a TypeScript error if a new error type is added.
      // eslint-disable-next-line default-case
      switch (body.error) {
        case 'api-no-token':
        case 'api--notion--invalid-token':
          errorMessage = 'No token';
          errorType = 'service--get-pages--invalid-auth';
          break;
        case 'body-not-json':
        case 'no-app-version':
        case 'no-message-body':
        case 'api--notion--client-other':
        case 'api--notion--notionhq-other':
        case 'api--notion--rate-limit':
        case 'api--notion--server-other':
        case 'api--notion--unknown':
          errorMessage = `Other error ${body.error}`;
          errorType = 'service--get-pages--other';
          break;
      }

      return serializeResult(
        resultError(errorMessage, errorType, undefined, {
          status: response.status,
          statusText: response.statusText,
        })
      );
    } catch {
      log.error(
        'Calling notionGetPages: Finish - could not parse error response body'
      );
      return serializeResult(
        resultError(
          `Error getting pages: ${response.statusText} - ${response.status}`,
          'service--get-pages--other',
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
      log.info('Calling notionGetPages: Error', e);
      return serializeResult(
        resultError(e.name, 'service--get-pages--other', e)
      );
    }
    log.info('Calling notionGetPages: Error');
    return serializeResult(
      resultError('Error fetching client ID', 'service--get-pages--other')
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
