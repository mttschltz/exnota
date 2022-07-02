import { Response } from '@netlify/functions/dist/function/response'
import { Event } from '@netlify/functions/dist/function/event'
import cookie from 'cookie'

const COOKIE_TOKEN = 'exnota_notiontoken'

const addTokenCookie = (token: string, multiValueHeaders: NonNullable<Response['multiValueHeaders']>) => {
    const setCookies = multiValueHeaders['Set-Cookie'] || []
    
    // TODO: Go through steps here: https://www.rdegges.com/2018/please-stop-using-local-storage/
    const tokenCookie = cookie.serialize(COOKIE_TOKEN, token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 365 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
    })
    
    return {
        ...multiValueHeaders,
        'Set-Cookie': [...setCookies, tokenCookie]
    }
}

const getToken = (headers: Event['headers']): string | undefined => {
    const cookies = cookie.parse(headers['cookie'] || '')
    return cookies[COOKIE_TOKEN]
}

export { getToken, addTokenCookie }