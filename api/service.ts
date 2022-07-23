// common
const BASE = (typeof process !== 'undefined' && process?.env?.NETLIFY_FUNCTIONS_BASE) ? process?.env?.NETLIFY_FUNCTIONS_BASE : 'http://localhost:9999/.netlify/functions/'

const ERROR_COMMON = {
    NO_APP_VERSION: 'no-app-version',
    NO_MESSAGE_BODY: 'no-message-body',
    BODY_NOT_JSON: 'body-not-json',
    NO_TOKEN: 'api-no-token',
  } as const

const ERROR_NOTION = {
    INVALID_TOKEN: 'api--notion--invalid-token',
    RATE_LIMIT: 'api--notion--rate-limit',
    OTHER_SERVER: 'api--notion--server-other',
    OTHER_CLIENT: 'api--notion--client-other',
    OTHER_NOTIONHQ: 'api--notion--notionhq-other',
    UNKNOWN: 'api--notion--unknown',
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
        title: string
        url: string
    }[]
}

const GET_PAGES_ERROR = {...ERROR_COMMON, ...ERROR_NOTION} as const

interface GetPagesNotionApiErrorResponse {
    error: typeof GET_PAGES_ERROR[keyof typeof GET_PAGES_ERROR]
}

// get page
const GET_PAGE_URI_PART =  'get-page'
const getPageNotionApiPath = () => `${BASE}${GET_PAGE_URI_PART}`

interface GetPageNotionApiRequest {
    id: string
}

type GetPageNotionApiSuccessResponse = {
    page: {
        id: string
        title: string
        url: string
    }
}

const GET_PAGE_ERROR = {...ERROR_COMMON, ...ERROR_NOTION,
    NO_ID: 'api--get-page--no-id',
    NO_ACCESS: 'api--get-page--no-access',
    NOT_FOUND: 'api--get-page--not-found',
} as const

interface GetPageNotionApiErrorResponse {
    error: typeof GET_PAGE_ERROR[keyof typeof GET_PAGE_ERROR]
}

export {
    ERROR_NOTION,
    // client id
    getClientIdNotionApiPath,
    GET_NOTION_CLIENT_ID_URI_PART,
    // get token
    getTokenNotionApiPath,
    GET_TOKEN_URI_PART,
    GET_TOKEN_ERROR,
    // get pages
    getPagesNotionApiPath,
    GET_PAGES_URI_PART,
    GET_PAGES_ERROR,
    // get page
    getPageNotionApiPath,
    GET_PAGE_URI_PART,
    GET_PAGE_ERROR,
}
export type {
    // client id
    GetClientIdNotionApiResponse,
    // get token
    GetTokenNotionApiSuccessResponse,
    GetTokenNotionApiErrorResponse,
    // get pages
    GetPagesNotionApiSuccessResponse,
    GetPagesNotionApiErrorResponse,
    // get page
    GetPageNotionApiRequest,
    GetPageNotionApiSuccessResponse,
    GetPageNotionApiErrorResponse,
}