import { Result, resultError, resultOk } from "../util/result"

interface Options {
  _notionIntegrationToken: string
}

class OptionsImpl implements Options {
  _notionIntegrationToken: string
  
  public constructor(notionIntegrationToken: string) {
    this._notionIntegrationToken = notionIntegrationToken
  }

  public get notionIntegrationToken(): string {
    return this._notionIntegrationToken
  }
}

type OptionsError = 'missing-notion-integration-token'

const createOptions = (notionIntegrationToken: string): Result<Options, OptionsError> => {
  if (!notionIntegrationToken) {
    return resultError('Missing notion integration token', 'missing-notion-integration-token')
  }
  
  return resultOk(new OptionsImpl(notionIntegrationToken))
}

export type { Options, OptionsError }
export { createOptions }