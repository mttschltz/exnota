// common
const BASE = (typeof process !== 'undefined' && process?.env?.NETLIFY_FUNCTIONS_BASE) ? process?.env?.NETLIFY_FUNCTIONS_BASE : 'http://localhost:9999/.netlify/functions/'

const ERROR_COMMON = {
    NO_APP_VERSION: 'no-app-version',
    NO_MESSAGE_BODY: 'no-message-body',
    BODY_NOT_JSON: 'body-not-json',
  } as const

// get client id
const GET_NOTION_CLIENT_ID_URI_PART =  'get-notion-client-id'
const getClientIdNotionApiPath = () => `${BASE}${GET_NOTION_CLIENT_ID_URI_PART}`

interface GetClientIdNotionApiResponse {
    clientId: string
}

// get token
const GET_TOKEN_URI_PART =  'get-token'
const getTokenNotionApiPath = () => `${BASE}${GET_TOKEN_URI_PART}`

interface GetTokenNotionApiSuccessResponse {
    tokenResponse: any
}

interface GetTokenNotionApiErrorResponse {
    error: typeof GET_TOKEN_ERROR[keyof typeof GET_TOKEN_ERROR]
}

// TODO: Refactor so that keys and values cannot be duplicates
const GET_TOKEN_ERROR = {...ERROR_COMMON, 
    NO_CODE: 'no-code',
    NO_REDIRECT_URL: 'no-redirect-url',
    TOKEN_REQUEST_CREATION_FAILED: 'token-request-creation-failed',
    TOKEN_REQUEST_FAILED: 'token-request-failed',
    TOKEN_REQUEST_UNSUCCESSFUL: 'token-request-unsuccessful',
    NOTION_OAUTH_TOKEN_INVALID_CLIENT: 'notion-invalid-client',
    NOTION_OAUTH_TOKEN_INVALID_REQUEST: 'notion-invalid-request',
    NOTION_OAUTH_TOKEN_INVALID_GRANT: 'notion-invalid-grant',
    NOTION_OAUTH_TOKEN_UNAUTHORIZED_CLIENT: 'notion-unauthorized-client',
    NOTION_OAUTH_TOKEN_UNSUPPORTED_GRANT_TYPE: 'notion-unsupported-grant-type',
    NOTION_OAUTH_TOKEN_INVALID_SCOPE: 'notion-invalid-scope',
    NOTION_OAUTH_TOKEN_UNKNOWN: 'notion-oauth-token-unknown',
    TOKEN_RESPONSE_NOT_PARSEABLE: 'token-response-not-parseable',
    TOKEN_RESPONSE_MISSING_TOKEN: 'token-response-missing-token',
} as const

// get pages
const GET_PAGES_URI_PART =  'get-pages'
const getPagesNotionApiPath = () => `${BASE}${GET_PAGES_URI_PART}`

interface GetPagesNotionApiSuccessResponse {
    pages: {
        id: string
        name: string
    }[]
}

const GET_PAGES_ERROR = {...ERROR_COMMON, 
    NO_TOKEN: 'api-no-token',
} as const

interface GetPagesNotionApiErrorResponse {
    error: typeof GET_PAGES_ERROR[keyof typeof GET_PAGES_ERROR]
}

export {
    getClientIdNotionApiPath, getTokenNotionApiPath, getPagesNotionApiPath, GET_TOKEN_ERROR, GET_PAGES_ERROR, GET_TOKEN_URI_PART , GET_PAGES_URI_PART , GET_NOTION_CLIENT_ID_URI_PART
}
export type {
    GetClientIdNotionApiResponse,
    GetTokenNotionApiSuccessResponse,
    GetTokenNotionApiErrorResponse,
    GetPagesNotionApiSuccessResponse,
    GetPagesNotionApiErrorResponse,
}