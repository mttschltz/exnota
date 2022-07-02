import { Event } from '@netlify/functions/dist/function/event'

const HEADER_APP_VERSION = 'x-app-version'

const getAppVersion = (headers: Event['headers']): string | undefined => {
  return headers[HEADER_APP_VERSION];
}

const hasAppVersion = (headers: Event['headers']): boolean => {
  return !!getAppVersion(headers);
}

export { getAppVersion, hasAppVersion }