import {Errors, Result} from '@lib/result';
import {AuthConfig, ExpectedTokenResponse, newAuthConfig} from './authConfig';
import {newOptionsConfig, OptionsConfig} from './optionsConfig';

type RepoStorageSetError = 'storage-set';
type RepoStorageGetError = 'storage-get';

interface AuthConfigRepo {
  readonly getConfig: () => Promise<
    Result<
      AuthConfig | undefined,
      Errors<typeof newAuthConfig, RepoStorageGetError>
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
    Result<void, Errors<RepoStorageSetError, typeof newOptionsConfig>>
  >;
  readonly getConfig: () => Promise<
    Result<
      OptionsConfig | undefined,
      Errors<RepoStorageGetError, typeof newOptionsConfig>
    >
  >;
}

export type {AuthConfigRepo, OptionsConfigRepo, ExpectedTokenResponse};
