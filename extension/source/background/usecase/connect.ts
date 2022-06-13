import {createLog} from '@lib/log';
import {FunctionError, Result, resultError, resultOk} from '@lib/result';
import {OptionsRepo, TokenResponse} from '@background/repo';
import {Page} from '@background/page';

type ConnectServiceError = 'error-getting-token' | 'error-getting-pages';

type ConnectError =
  | FunctionError<OptionsRepo['setCode']>
  | ConnectServiceError
  | 'no-pages-granted';

type ConnectRepo = Pick<
  OptionsRepo,
  'setCode' | 'setTokenResponse' | 'setPageId'
>;

interface ConnectService {
  getToken: (
    code: string
  ) => Promise<Result<TokenResponse, ConnectServiceError>>;
  getPages: (token: string) => Promise<Result<Page[], 'error-getting-pages'>>;
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
    code: string
  ) => Promise<Result<ConnectResponse, ConnectError>>;
}

const newConnectInteractor = (
  repo: ConnectRepo,
  service: ConnectService
): ConnectInteractor => {
  const Connect: ConnectInteractor = {
    async connect(code): Promise<Result<ConnectResponse, ConnectError>> {
      // TODO: Complete all dependencies
      // TODO: Add message that calls this
      // TODO: Test all cases

      // persist code
      log.info('Calling repo.setCode: Start');
      const result = await repo.setCode(code);
      log.info('Calling repo.setCode: Finish');
      if (!result.ok) {
        log.info('Calling repo.setCode: Error');
        return result;
      }

      // call get-token and persist
      log.info('Calling service.getToken: Start');
      const tokenResponesResult = await service.getToken(code);
      log.info('Calling service.getToken: Finish');
      if (!tokenResponesResult.ok) {
        log.info('Calling service.getToken: Error');
        return tokenResponesResult;
      }

      log.info('Calling repo.setTokenResponse: Start');
      const setTokenResponse = await repo.setTokenResponse(
        tokenResponesResult.value
      );
      log.info('Calling repo.setTokenResponse: Finish');
      if (!setTokenResponse.ok) {
        log.info('Calling repo.setTokenResponse: Error');
        return setTokenResponse;
      }

      // call get-pages to find how many pages we have access to
      log.info('Calling service.getPages: Start');
      const getPagesResult = await service.getPages(
        tokenResponesResult.value.access_token
      );
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

      log.info('One page granted access');
      const response: PageSetResponse = {
        status: 'page-set',
      };
      return resultOk(response);
    },
  };
  return Connect;
};

export type {ConnectError, ConnectInteractor, ConnectRepo, ConnectResponse};
export {newConnectInteractor};
