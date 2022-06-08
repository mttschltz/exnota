import {FunctionError, Result} from '@lib/result';
import {Options} from './options';
import {Page} from './page';

interface OptionsRepo {
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

export type {OptionsRepo, PageRepo};