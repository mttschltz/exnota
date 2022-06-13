interface GetNotionClientIdApiResponse {
    clientId: string
}

const BASE = (typeof process !== 'undefined' && process?.env?.NETLIFY_FUNCTIONS_BASE) ? process?.env?.NETLIFY_FUNCTIONS_BASE : 'http://localhost:9999/.netlify/functions/'

const GET_NOTION_CLIENT_ID =  'get-notion-client-id'
const notionClientIdApiPath = () => `${BASE}${GET_NOTION_CLIENT_ID}`

export {
    notionClientIdApiPath
}
export type {
    GetNotionClientIdApiResponse
}