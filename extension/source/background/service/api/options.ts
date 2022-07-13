import {
  GetPageNotionApiErrorResponse,
  getPageNotionApiPath,
  GetPageNotionApiRequest,
  GetPageNotionApiSuccessResponse,
} from '@api/service';
import {GetPageError, GetPageService} from '@background/service';
import {createLog, isErrorish} from '@lib/log';
import {resultError, resultOk, serializeResult} from '@lib/result';
import {browser} from 'webextension-polyfill-ts';

const getPage: GetPageService = async (id: string) => {
  const log = createLog('background', 'GetPageService');

  log.info('Calling notionGetPage: Start');
  try {
    const headers = new Headers();
    headers.append('X-App-Version', browser.runtime.getManifest().version);

    const requestBody: GetPageNotionApiRequest = {id};
    const response = await fetch(getPageNotionApiPath(), {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(requestBody),
    });
    if (response.ok) {
      log.info('Calling notionGetPage: Finish - ok response');
      // TODO: Update
      const body: GetPageNotionApiSuccessResponse = await response.json();
      return resultOk({
        page: body.page,
      });
    }

    log.info('Calling notionGetPage: Finish - not ok response');
    try {
      // response.json() will throw a syntax error if the body isn't valid JSON, which at time
      // of writing happens if the function service is down.
      const body: Partial<GetPageNotionApiErrorResponse> =
        await response.json();
      if (!body.error) {
        return resultError(
          `Error getting page: ${body?.error} (${response.statusText} - ${response.status})`,
          'service--get-page--other',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
          }
        );
      }

      let errorMessage: string;
      let errorType: GetPageError;
      // No default case so that we get a TypeScript error if a new error type is added.
      // eslint-disable-next-line default-case
      switch (body.error) {
        case 'api--get-page--no-access':
          errorMessage = 'No access to page';
          errorType = 'service--get-page--no-page-access';
          break;
        case 'api-no-token':
        case 'api--invalid-token':
          errorMessage = 'No token';
          errorType = 'service--get-page--invalid-auth';
          break;
        case 'api--get-page--not-found':
          errorMessage = 'Page not found';
          errorType = 'service--get-page--no-page-access';
          break;
        case 'api--get-page--no-id':
        case 'body-not-json':
        case 'no-app-version':
        case 'no-message-body':
          errorMessage = `Other error ${body.error}`;
          errorType = 'service--get-page--other';
          break;
      }
      return resultError(errorMessage, errorType);
    } catch {
      return resultError(
        `Error getting page: ${response.statusText} - ${response.status}`,
        'service--get-page--other',
        undefined,
        {
          status: response.status,
          statusText: response.statusText,
        }
      );
    }
  } catch (e) {
    if (isErrorish(e)) {
      log.info('Calling notionGetPage: Error', e);
      return serializeResult(
        resultError(e.name, 'service--get-page--other', e)
      );
    }
    log.info('Calling notionGetPage: Error');
    return serializeResult(
      resultError('Error fetching client ID', 'service--get-page--other')
    );
  }
};

export {getPage};
