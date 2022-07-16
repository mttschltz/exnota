import {createLog} from '@lib/log';
import {Errors, Result, resultError, resultOk} from '@lib/result';
import {
  AuthConfigRepo,
  ExpectedTokenResponse,
  OptionsConfigRepo,
} from '@background/repo';
import {Page} from '@background/page';
import {newAuthConfig} from '@background/authConfig';
import {newOptionsConfig} from '@background/optionsConfig';
import {GetPagesError, GetPagesService} from '@background/service';

type ConnectServiceError = Errors<'error-getting-token', GetPagesError>;

type ConnectError = Errors<
  Errors<AuthConfigRepo['getConfig'], AuthConfigRepo['saveConfig']>,
  Errors<ConnectServiceError, 'no-pages-granted'>
>;

interface ConnectRepo {
  getAuthConfig: AuthConfigRepo['getConfig'];
  saveOptionsConfig: OptionsConfigRepo['saveConfig'];
  saveAuthConfig: AuthConfigRepo['saveConfig'];
}

interface ConnectService {
  getToken: (
    code: string,
    redirectURL: string
  ) => Promise<Result<ExpectedTokenResponse, ConnectServiceError>>;
  getPages: GetPagesService;
}

interface PageSetResponse {
  status: 'page-set';
}
interface MultiplePagesResponse {
  status: 'multiple-pages';
  pages: Page[];
}
type ConnectResponse = PageSetResponse | MultiplePagesResponse;

const log = createLog('background', 'ConnectUsecase');

interface ConnectInteractor {
  readonly connect: (
    code: string,
    redirectURL: string
  ) => Promise<Result<ConnectResponse, ConnectError>>;
}

const newConnectInteractor = (
  repo: ConnectRepo,
  service: ConnectService
): ConnectInteractor => {
  const Connect: ConnectInteractor = {
    async connect(
      code,
      redirectURL
    ): Promise<Result<ConnectResponse, ConnectError>> {
      // get auth config
      log.info('Calling repo.getAuthConfig: Start');
      const authConfigResult = await repo.getAuthConfig();
      if (!authConfigResult.ok) {
        return authConfigResult;
      }
      let authConfig = authConfigResult.value;
      log.info('Calling repo.getAuthConfig: Finish');

      if (authConfig) {
        authConfig.code = code;
        // If code changes, we want a new token as well
        authConfig.setTokenResponse(undefined);
      } else {
        const newAuthConfigResult = newAuthConfig(code, undefined);
        if (!newAuthConfigResult.ok) {
          return newAuthConfigResult;
        }
        authConfig = newAuthConfigResult.value;
      }

      // persist code immediately as we don't have transactions
      log.info('Calling repo.saveAuthConfig: Start');
      const saveAuthCodeResult = await repo.saveAuthConfig(authConfig);
      log.info('Calling repo.saveAuthConfig: Finish');
      if (!saveAuthCodeResult.ok) {
        log.info('Calling repo.saveAuthConfig: Error', saveAuthCodeResult);
        return saveAuthCodeResult;
      }

      // call get-token and persist result
      // the token itself is saved as a cookie
      log.info('Calling service.getToken: Start');
      const tokenResponseResult = await service.getToken(code, redirectURL);
      log.info('Calling service.getToken: Finish');
      if (!tokenResponseResult.ok) {
        log.info('Calling service.getToken: Error');
        return tokenResponseResult;
      }

      // persist token
      authConfig.setTokenResponse(tokenResponseResult.value);
      log.info('Calling repo.saveAuthConfig: Start');
      const saveAuthConfigResult = await repo.saveAuthConfig(authConfig);
      log.info('Calling repo.saveAuthConfig: Finish');
      if (!saveAuthConfigResult.ok) {
        log.info('Calling repo.saveAuthConfig: Error');
        return saveAuthConfigResult;
      }

      // call get-pages to find how many pages we have access to
      log.info('Calling service.getPages: Start');
      const getPagesResult = await service.getPages();
      log.info('Calling service.getPages: Finish');
      if (!getPagesResult.ok) {
        log.info('Calling service.getPages: Error');
        return getPagesResult;
      }

      const pages = getPagesResult.value;
      if (!pages.length) {
        log.info('No pages granted access');
        return resultError('No pages granted access', 'no-pages-granted');
      }

      if (pages.length > 1) {
        log.info('More than one page granted access');
        const response: MultiplePagesResponse = {
          status: 'multiple-pages',
          pages,
        };
        return resultOk(response);
      }

      // Create new options config as the page is currently the only property
      const optionsConfig = newOptionsConfig(pages[0]);

      // persist page to options
      log.info('Calling repo.saveOptionsConfig: Start');
      const saveAuthResult = await repo.saveOptionsConfig(optionsConfig);
      log.info('Calling repo.saveOptionsConfig: Finish');
      if (!saveAuthResult.ok) {
        log.info('Calling repo.saveOptionsConfig: Error', saveAuthResult);
        return saveAuthResult;
      }

      log.info('One page granted access');
      const response: PageSetResponse = {
        status: 'page-set',
      };
      return resultOk(response);
    },
  };
  return Connect;
};

export type {
  ConnectError,
  ConnectInteractor,
  ConnectRepo,
  ConnectResponse,
  ConnectService,
};
export {newConnectInteractor};
