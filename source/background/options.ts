import {Result, resultError, resultOk} from '../util/result';

type OptionsJson = {
  notionIntegrationToken: string;
};

type Options = OptionsJson & {
  setNotionIntegrationToken: (
    notionIntegrationToken: string
  ) => Result<undefined, 'missing-token'>;
  asJson: () => OptionsJson;
};

class OptionsImpl implements Options {
  _notionIntegrationToken: string;

  public constructor(notionIntegrationToken: string) {
    this._notionIntegrationToken = notionIntegrationToken;
  }

  public get notionIntegrationToken(): string {
    return this._notionIntegrationToken;
  }

  public setNotionIntegrationToken(
    notionIntegrationToken: string
  ): Result<undefined, 'missing-token'> {
    if (
      typeof notionIntegrationToken !== 'string' ||
      notionIntegrationToken.length === 0
    ) {
      return resultError('Notion integration token missing', 'missing-token');
    }
    this._notionIntegrationToken = notionIntegrationToken;
    return resultOk(undefined);
  }

  public asJson(): OptionsJson {
    return {
      notionIntegrationToken: this._notionIntegrationToken,
    };
  }
}

const newOptions = (json: OptionsJson): Options => {
  return new OptionsImpl(json.notionIntegrationToken);
};

export type {Options, OptionsJson};
export {newOptions};
