import { GetPagesNotionApiErrorResponse, GetPagesNotionApiSuccessResponse, GET_PAGES_ERROR, GET_TOKEN_ERROR } from "@api/service";
import { Handler } from "@netlify/functions";
import { Client } from '@notionhq/client'
import { hasAppVersion } from "src/helper/appVersion";
import { getTraceIdentifiers, hasTraceIdentifiers } from "src/helper/identifier";
import { createLog, unknownError } from "src/helper/log";
import { api } from "src/helper/notionApi";
import { getToken } from "src/helper/token";

const resultOk = (response: GetPagesNotionApiSuccessResponse) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  }
}

const resultError = (response: GetPagesNotionApiErrorResponse) => {
  return {
    statusCode: 400,
    body: JSON.stringify(response),
  }
}

const handler: Handler = async (event, context) => {
  const log = createLog('get-pages', { ...getTraceIdentifiers(event.headers)});
  log.info('Started')

  if (!hasAppVersion(event.headers)) {
    log.info('No app version')
    return resultError({error: GET_TOKEN_ERROR.NO_APP_VERSION})
  }
  
  const token = getToken(event.headers)
  if (!token) {
    log.info('No token')
    return resultError({error: GET_PAGES_ERROR.NO_TOKEN})
  }

  const notion = new Client({
    auth: token,
  });
  const res = await api(notion.search, notion, {
    filter: {
      property: "object",
      value: 'page',
    },
  });

  if (res.status === "api-error") {
    log.error('Unknown error', {
      body: res.error.body,
      code: res.error.code,
      message: res.error.message,
      name: res.error.name,
      status: res.error.status,
    })
    return resultError({
      error: res.category
    })
  }
  if (res.status === 'unknown-error') {
    log.error('Unknown error', unknownError(res.error))
    return resultError({
      error: 'api--notion--unknown',
    })
  }

  const pages: GetPagesNotionApiSuccessResponse['pages'] = []

  // The OAuth flow seems to only support selecting top level pages, so we'll only look for those
  // pages in the results. The results also return subpages of those top level pages.
  const topLevelPages: typeof res.result.results[number][] = []
  res.result.results.forEach(async (page) => {
    if (page.object === 'page') {
      if (!('parent' in page)) {
        // According to the docs, all pages have a parent: https://developers.notion.com/reference/page
        // so I'm not sure what this branch of the union type represents 
        log.warn(`Page ${page.id} has no parent`)
      } else if (page.parent.type === 'workspace') {
        topLevelPages.push(page)
      }
    }
  })

  if (topLevelPages.length) {
    topLevelPages.forEach((page) => {
      if (page.object !== 'page' || !('parent' in page)) {
        return
      }
      
      const propKeyValues = Object.entries(page.properties)
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
        log.warn(`Page ${page.id} has no title`)
        return
      }
      pages.push({
        id: page.id,
        title,
        url: page.url,
      })
    })
  }

  if (res.result.has_more) {
    log.info('Has more pages')
  }
  
  log.info('Finished')
  return resultOk({
    pages,
  })
};

export { handler };
