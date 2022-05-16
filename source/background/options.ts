type Options = {
  notionIntegrationToken: string
}

class OptionsImpl implements Options {
  _notionIntegrationToken: string
  
  public constructor(notionIntegrationToken: string) {
    this._notionIntegrationToken = notionIntegrationToken
  }

  public get notionIntegrationToken(): string {
    return this._notionIntegrationToken
  }

  // TODO: Add length requirement to setter for notionIntegrationToken
}

type OptionsError = 'missing-notion-integration-token'

const newOptions = (notionIntegrationToken: string): Options => {
  return new OptionsImpl(notionIntegrationToken)
}

export type { Options, OptionsError }
export { newOptions }