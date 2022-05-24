import {Options} from './options';
import {FunctionError, Result} from '../util/result';

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
