import {Result, resultError, resultOk} from '@lib/result';

// Response expected from Notion API when getting a token. Notion recommends storing it all to
// prevent requiring a re-auth if the information is needed later.
interface ExpectedTokenResponse {
  access_token: string;
  token_type?: 'bearer';
  bot_id?: string;
  workspace_name?: string;
  workspace_icon?: string;
  workspace_id?: string;
  owner?: {
    type?: 'user';
    user?: {
      object?: 'user';
      id?: string;
      name?: string;
      avatar_url?: string;
      type?: 'person';
      person?: {
        email?: string;
      };
    };
  };
}

interface AuthConfig {
  code?: string;
  readonly tokenResponse?: ExpectedTokenResponse;
  readonly setTokenResponse: (
    tokenResponse: ExpectedTokenResponse | undefined
  ) => Result<void, ErrorMissingToken>;
}

type ErrorMissingToken = 'error-missing-token';

const isAuthConfig = (authConfig: unknown): authConfig is AuthConfig => {
  if (typeof authConfig !== 'object' || authConfig === null) {
    return false;
  }

  const hasCode = 'code' in authConfig;
  if (hasCode && typeof (authConfig as AuthConfig)?.code !== 'string') {
    return false;
  }

  const hasTokenResponse = 'tokenResponse' in authConfig;
  if (
    hasTokenResponse &&
    typeof (authConfig as AuthConfig)?.tokenResponse?.access_token !== 'string'
  ) {
    return false;
  }

  // Ignore other properties
  return true;
};

class AuthConfigImpl implements AuthConfig {
  _code?: string;

  _tokenResponse?: ExpectedTokenResponse;

  public constructor(code?: string, tokenResponse?: ExpectedTokenResponse) {
    this._code = code;
    this._tokenResponse = tokenResponse;
  }

  public get code(): string | undefined {
    return this._code;
  }

  public set code(code: string | undefined) {
    this._code = code;
  }

  public get tokenResponse(): ExpectedTokenResponse | undefined {
    return this._tokenResponse;
  }

  public setTokenResponse(
    tokenResponse: ExpectedTokenResponse | undefined
  ): Result<void, ErrorMissingToken> {
    if (tokenResponse && !tokenResponse.access_token) {
      return resultError('Token response has no token', 'error-missing-token');
    }
    this._tokenResponse = tokenResponse;
    return resultOk(undefined);
  }
}

const newAuthConfig = (
  code?: string,
  tokenResponse?: ExpectedTokenResponse
): Result<AuthConfig, ErrorMissingToken> => {
  if (tokenResponse && !tokenResponse.access_token) {
    return resultError('Token response has no token', 'error-missing-token');
  }

  return resultOk(new AuthConfigImpl(code, tokenResponse));
};

export type {AuthConfig, ExpectedTokenResponse};
export {newAuthConfig, isAuthConfig};
