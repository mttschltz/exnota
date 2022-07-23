import { GetPageNotionApiErrorResponse, GetPageNotionApiRequest, GetPageNotionApiSuccessResponse, GetPagesNotionApiErrorResponse, GetPagesNotionApiSuccessResponse, GET_PAGES_ERROR, GET_PAGE_ERROR, GET_TOKEN_ERROR } from "@api/service";
import { Handler } from "@netlify/functions";
import { Client } from '@notionhq/client'
import { hasAppVersion } from "src/helper/appVersion";
import { getTraceIdentifiers, hasTraceIdentifiers } from "src/helper/identifier";
import { createLog, isErrorish, unknownError } from "src/helper/log";
import { api } from "src/helper/notionApi";
import { getToken } from "src/helper/token";

const resultOk = (response: GetPageNotionApiSuccessResponse) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  }
}

const resultError = (response: GetPageNotionApiErrorResponse) => {
  return {
    statusCode: 400,
    body: JSON.stringify(response),
  }
}

const handler: Handler = async (event, context) => {
  const log = createLog('get-page', { ...getTraceIdentifiers(event.headers)});
  log.info('Started')

  if (!hasAppVersion(event.headers)) {
    log.info('No app version')
    return resultError({error: GET_PAGE_ERROR.NO_APP_VERSION})
  }
  
  const token = getToken(event.headers)
  if (!token) {
    log.info('No token')
    return resultError({error: GET_PAGE_ERROR.NO_TOKEN})
  }
  
  if (!event || !event.body) {
    log.info('No message body')
    return resultError({error: GET_PAGE_ERROR.NO_MESSAGE_BODY})
  }
  
  // params
  let id
  try {
    const body = JSON.parse(event.body) as Partial<GetPageNotionApiRequest> | undefined
    id = body?.id
  } catch (e) {
    if (isErrorish(e)) {
      log.warn('Message body not JSON', {__type: 'error', message: e.message, name: e.name})
    } else {
      log.warn('Message body not JSON')
    }
    return resultError({error: GET_PAGE_ERROR.BODY_NOT_JSON})
  }
  if (!id || typeof id !== 'string') {
    log.warn('No ID')
    return resultError({error: GET_PAGE_ERROR.NO_ID})
  }

  
  const notion = new Client({
    auth: token,
  });

  const response = await api(notion.pages.retrieve, notion, {
    page_id: id,
  })
  
  if (response.status === "api-error") {
    log.error('Unknown error', {
      body: response.error.body,
      code: response.error.code,
      message: response.error.message,
      name: response.error.name,
      status: response.error.status,
    })
    return resultError({
      error: response.category
    })
  }
  if (response.status === 'unknown-error') {
    log.error('Unknown error', unknownError(response.error))
    return resultError({
      error: 'api--notion--unknown',
    })
  }

  let page: { id: string, title: string, url: string } | undefined
  if ('parent' in response.result) {
    const propKeyValues = Object.entries(response.result.properties)
    let title
    for (let i = 0; i < propKeyValues.length; i++) {
      const propValue = propKeyValues[i][1]
      if (propValue.type === 'title') {
        // TODO: Use translations
        title = propValue.title.reduce((prev, cur) => prev + cur.plain_text, '') ?? 'Untitled'
        break
      }
    }
    
    if (!title) {
      log.warn(`Page ${response.result.id} has no title`)
    }
    
    page = {
      id: response.result.id,
      // TODO: Use translations
      title: title ?? 'Untitled',
      url: response.result.url,
    }
  }

  if (!page) {
    log.info('Page not found')
    return resultError({error: 'api--get-page--not-found'})
  }

  log.info('Finished')
  return resultOk({
    page,
  })
};

export { handler };
