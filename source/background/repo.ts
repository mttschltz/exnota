import {FunctionError, Result} from '@lib/result';
import {Options} from './options';

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

export type {OptionsRepo};
