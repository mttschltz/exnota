import {FunctionError, Result} from '@lib/result';
import {Options} from './options';
import {Page} from './page';

interface TokenResponse {
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

interface OptionsRepo {
  readonly setCode: (code: string) => Promise<Result<void, 'options-sync'>>;
  readonly setTokenResponse: (
    tokenResponse: TokenResponse
  ) => Promise<Result<void, 'options-sync'>>;
  readonly setPageId: (pageId: string) => Promise<Result<void, 'options-sync'>>;
  readonly getOptions: () => Promise<Result<Options, 'options-sync'>>;
  readonly setNotionIntegrationToken: (
    notionIntegrationToken: string
  ) => Promise<
    Result<
      Options,
      'options-sync' | FunctionError<Options['setNotionIntegrationToken']>
    >
  >;
}

interface PageRepo<E> {
  readonly createPage: () => Promise<Result<Page, E>>;
}

export type {OptionsRepo, PageRepo, TokenResponse};
