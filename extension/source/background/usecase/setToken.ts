import {createLog} from '@lib/log';
import {FunctionError, Result, resultOk} from '@lib/result';
import {Options} from '@background/options';
import {OptionsRepo} from '@background/repo';

type ValidateTokenApiError =
  | 'notion-invalid-token'
  | 'notion-rate-limit-error'
  | 'notion-request-error' // an error likely inside our control
  | 'notion-other-error' // an error likely outside our control
  | 'unknown-error';

type ValidateToken = (
  token: string
) => Promise<Result<undefined, ValidateTokenApiError>>;

type SetTokenError =
  | FunctionError<OptionsRepo['setNotionIntegrationToken']>
  | ValidateTokenApiError;

type SetTokenRepo = Pick<OptionsRepo, 'setNotionIntegrationToken'>;

const log = createLog('background', 'SetTokenUsecase');
interface SetTokenInteractor {
  readonly setToken: (token: string) => Promise<Result<Options, SetTokenError>>;
}

const newSetTokenInteractor = (
  repo: SetTokenRepo,
  validate: ValidateToken
): SetTokenInteractor => {
  const SetToken: SetTokenInteractor = {
    async setToken(token): Promise<Result<Options, SetTokenError>> {
      const validateResult = await validate(token);
      if (!validateResult.ok) {
        return validateResult;
      }

      log.info('Calling repo.setNotionIntegrationToken: Start');
      const result = await repo.setNotionIntegrationToken(token);
      log.info('Calling repo.setNotionIntegrationToken: Finish');

      if (!result.ok) {
        log.info('Error result', result);
        return result;
      }
      return resultOk(result.value);
    },
  };
  return SetToken;
};

export type {
  SetTokenError,
  SetTokenInteractor,
  SetTokenRepo,
  ValidateToken,
  ValidateTokenApiError,
};
export {newSetTokenInteractor};
