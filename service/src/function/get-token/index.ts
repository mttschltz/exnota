import { Handler } from "@netlify/functions";
import { GetTokenNotionApiSuccessResponse, GET_TOKEN_ERROR } from "@api/service";
import fetch from 'node-fetch'
import type { Response } from 'node-fetch'
import { addTokenCookie } from "src/helper/token";
import { createLog } from "src/helper/log";
import { getTraceIdentifiers } from "src/helper/identifier";
import { hasAppVersion } from "src/helper/appVersion";

const isNotionError = (json: unknown): json is { error: string } => typeof json === 'object' && json !== null && 'error' in json
const isTokenResponse = (json: unknown): json is { access_token: string } => typeof json === 'object' && json !== null && 'access_token' in json

const resultOk = (response: GetTokenNotionApiSuccessResponse, token: string) => {
  // TODO: Add identifier cookies
  const multiValueHeaders = addTokenCookie(token, {})
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    multiValueHeaders,
  }
}

const handler: Handler = async (event, context) => {
  const log = createLog('get-token', { ...getTraceIdentifiers(event.headers)});
  log.info('Started')
  
  if (!hasAppVersion(event.headers)) {
    log.info('No app version')
    return {
      statusCode: 400,
      body: JSON.stringify({error: GET_TOKEN_ERROR.NO_APP_VERSION})
    }
  }

  if (!event || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: GET_TOKEN_ERROR.NO_MESSAGE_BODY})
    }
  }
  
  // params
  let code
  let redirectURL
  try {
    const body = JSON.parse(event.body)
    code = body?.code
    redirectURL = body?.redirectURL
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: GET_TOKEN_ERROR.BODY_NOT_JSON})
    }
  }
  if (!code || typeof code !== 'string') {
    return {
      statusCode: 400,
      body: JSON.stringify({error: GET_TOKEN_ERROR.NO_CODE})
    }
  }
  if (!redirectURL || typeof redirectURL !== 'string') {
    return {
      statusCode: 400,
      body: JSON.stringify({error: GET_TOKEN_ERROR.NO_REDIRECT_URL})
    }
  }
  
  // notion api request
  const body = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectURL,
  };
  let basicAuth: string
  try {
    basicAuth = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_INTEGRATION_SECRET}`).toString('base64')
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: GET_TOKEN_ERROR.TOKEN_REQUEST_CREATION_FAILED})
    }
  }
  let response: Response
  try {
    response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify(body),
      });
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: GET_TOKEN_ERROR.TOKEN_REQUEST_FAILED})
    }
  }
  
  // notion api response handling
  let json
  try {
    json = await response.json();
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: GET_TOKEN_ERROR.TOKEN_RESPONSE_NOT_PARSEABLE})
    }
  }
  if (!response.ok) {
    if (!isNotionError(json)) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: GET_TOKEN_ERROR.TOKEN_REQUEST_UNSUCCESSFUL})
      }
    }

    let error: typeof GET_TOKEN_ERROR[keyof typeof GET_TOKEN_ERROR]
    switch (json.error) {
      // Notion uses standard OAuth error codes as listed at:
      // https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1
      case 'invalid_request':
        error = GET_TOKEN_ERROR.NOTION_OAUTH_TOKEN_INVALID_CLIENT
        break;
      case 'invalid_client':
        error = GET_TOKEN_ERROR.NOTION_OAUTH_TOKEN_INVALID_CLIENT
        break;
      case 'invalid_grant':
        error = GET_TOKEN_ERROR.NOTION_OAUTH_TOKEN_INVALID_GRANT
        break;
      case 'unauthorized_client':
        error = GET_TOKEN_ERROR.NOTION_OAUTH_TOKEN_UNAUTHORIZED_CLIENT
        break;
      case 'unsupported_grant_type':
        error = GET_TOKEN_ERROR.NOTION_OAUTH_TOKEN_UNSUPPORTED_GRANT_TYPE
        break;
      case 'invalid_scope':
        error = GET_TOKEN_ERROR.NOTION_OAUTH_TOKEN_INVALID_SCOPE
        break;
      default:
        error = GET_TOKEN_ERROR.NOTION_OAUTH_TOKEN_UNKNOWN
        break;
    }

      return {
        statusCode: 400,
        body: JSON.stringify({error})
      }
    }
    
  if (!isTokenResponse(json)) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: GET_TOKEN_ERROR.TOKEN_RESPONSE_MISSING_TOKEN})
    }
  }

  // TODO: encrypt this
  const token = json.access_token
  // Remove token from response so it's not stored raw in local storage:
  // https://www.rdegges.com/2018/please-stop-using-local-storage/
  const responseJson = {...json, access_token: undefined}
  return resultOk({ tokenResponse: responseJson }, token)
};

export { handler };
