import {
  GetPageNotionApiErrorResponse,
  getPageNotionApiPath,
  GetPageNotionApiRequest,
  GetPageNotionApiSuccessResponse,
} from '@api/service';
import {VerifyPageService} from '@background/usecase/verifyPage';
import {createLog, isErrorish} from '@lib/log';
import {resultError, resultOk, serializeResult} from '@lib/result';
import {browser} from 'webextension-polyfill-ts';

const getPage: VerifyPageService['getPage'] = async (id: string) => {
  const log = createLog('background', 'GetPageService');

  log.info('Calling notionGetPages: Start');
  try {
    const headers = new Headers();
    headers.append('X-App-Version', browser.runtime.getManifest().version);

    const requestBody: GetPageNotionApiRequest = {id}
    const response = await fetch(getPageNotionApiPath(), {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(requestBody),
    });
    if (response.ok) {
      log.info('Calling notionGetPage: Finish - ok response');
      const body: GetPageNotionApiSuccessResponse = await response.json();
      return serializeResult(resultOk(body));
    }

    log.info('Calling notionGetPage: Finish - not ok response');
    try {
      // response.json() will throw a syntax error if the body isn't valid JSON, which at time
      // of writing happens if the function service is down.
      const body: GetPageNotionApiErrorResponse = await response.json();
      return serializeResult(
        resultError(
          `Error getting page: ${body?.error} (${response.statusText} - ${response.status})`,
          'error-getting-page',
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
          `Error getting page: ${response.statusText} - ${response.status}`,
          'error-getting-page',
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
      log.info('Calling notionGetPage: Error', e);
      return serializeResult(resultError(e.name, 'error-getting-page', e));
    }
    log.info('Calling notionGetPage: Error');
    return serializeResult(
      resultError('Error fetching client ID', 'error-getting-page')
    );
  }
};

export {getPage};
