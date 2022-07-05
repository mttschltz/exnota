import {FunctionResultError, Result} from '@lib/result';
import {AuthConfig, ExpectedTokenResponse, newAuthConfig} from './authConfig';
import {newOptionsConfig, OptionsConfig} from './optionsConfig';

type RepoStorageSetError = 'storage-set';
type RepoStorageGetError = 'storage-get';

interface AuthConfigRepo {
  readonly getConfig: () => Promise<
    Result<
      AuthConfig | undefined,
      FunctionResultError<typeof newAuthConfig> | RepoStorageGetError
    >
  >;
  readonly saveConfig: (
    authConfig: AuthConfig
  ) => Promise<Result<void, RepoStorageSetError>>;
}

interface OptionsConfigRepo {
  readonly saveConfig: (
    optionsConfig: OptionsConfig
  ) => Promise<
    Result<
      void,
      RepoStorageSetError | FunctionResultError<typeof newOptionsConfig>
    >
  >;
  readonly getConfig: () => Promise<
    Result<
      OptionsConfig | undefined,
      RepoStorageGetError | FunctionResultError<typeof newOptionsConfig>
    >
  >;
}

export type {AuthConfigRepo, OptionsConfigRepo, ExpectedTokenResponse};
