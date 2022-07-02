import { Response } from '@netlify/functions/dist/function/response'
import { Event } from '@netlify/functions/dist/function/event'
import cookie from 'cookie'

const COOKIE_BOT_ID = 'exnota_notionbotid'
const COOKIE_WORKSPACE_ID = 'exnota_notionworkspaceid'

interface TraceIdentifiers {
    botId: string
    workspaceId: string
}

const setTraceIdentifierCookies = (traceIdentifiers: TraceIdentifiers, multiValueHeaders: NonNullable<Response['multiValueHeaders']>) => {
    const setCookies = multiValueHeaders['Set-Cookie'] || []
    
    const botIdCookie = cookie.serialize(COOKIE_BOT_ID, traceIdentifiers.botId, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
    })
    const workspaceIdCookie = cookie.serialize(COOKIE_WORKSPACE_ID, traceIdentifiers.botId, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
    })
    
    return {
        ...multiValueHeaders,
        'Set-Cookie': [...setCookies, botIdCookie, workspaceIdCookie]
    }
}

const getTraceIdentifiers = (headers: Event['headers']): TraceIdentifiers => {
    const cookies = cookie.parse(headers['Cookie'] || '')
    const botId = cookies[COOKIE_BOT_ID]
    const workspaceId = cookies[COOKIE_WORKSPACE_ID]
    return {
        botId,
        workspaceId,
    }
}

const hasTraceIdentifiers = (headers: Event['headers']): boolean => {
    const traceIdentifiers = getTraceIdentifiers(headers)
    return !!traceIdentifiers.botId && !!traceIdentifiers.workspaceId
}

export { setTraceIdentifierCookies, getTraceIdentifiers, hasTraceIdentifiers }