import {createLog} from '@lib/log';
import {Errors, Result, resultError, resultOk} from '@lib/result';
import {OptionsConfigRepo} from '@background/repo';
import {newPage, Page} from '@background/page';
import {GetPageService, GetPagesService} from '@background/service';

type VerifyPageResponse =
  | {
      status: 'success';
      page: Page;
    }
  | {status: 'no-page' | 'no-page-access' | 'invalid-auth' | 'no-auth'};

type VerifyPageError = Errors<
  Errors<'usecase--verify-page--other'>,
  Errors<OptionsConfigRepo['getConfig'], typeof newPage>
>;

interface VerifyPageRepo {
  getOptionsConfig: OptionsConfigRepo['getConfig'];
}

interface VerifyPageService {
  getPage: GetPageService;
  getPages: GetPagesService;
}

const log = createLog('background', 'VerifyPageUsecase');

interface VerifyPageInteractor {
  readonly verifyPage: () => Promise<
    Result<VerifyPageResponse, VerifyPageError>
  >;
}

const newVerifyPageInteractor = (
  repo: VerifyPageRepo,
  service: VerifyPageService
): VerifyPageInteractor => {
  const VerifyPage: VerifyPageInteractor = {
    // Use last switch to ensure that any new error types will cause a TypeScript error.
    // eslint-disable-next-line consistent-return
    async verifyPage() {
      // get options config
      log.info('Calling repo.getOptionsConfig: Start');
      const optionsConfigResult = await repo.getOptionsConfig();
      if (!optionsConfigResult.ok) {
        return optionsConfigResult;
      }
      log.info('Calling repo.getOptionsConfig: Finish');

      if (optionsConfigResult.value === undefined) {
        return resultOk({
          status: 'no-auth',
        });
      }

      const id = optionsConfigResult.value.page.id;
      if (!id) {
        // Use get pages to test if token is valid
        log.info('Calling service.getPages: Start');
        const getPagesResult = await service.getPages();
        log.info('Calling service.getPages: Finish');
        if (getPagesResult.ok) {
          return resultOk({
            status: 'no-page',
          });
        }
        // No default case so that we get a TypeScript error if a new error type is added.
        // eslint-disable-next-line default-case
        switch (getPagesResult.errorType) {
          case 'service--get-pages--invalid-auth':
            return resultOk({
              status: 'invalid-auth',
            });
          case 'service--get-pages--other':
            return resultError(
              'Could not verify auth',
              'usecase--verify-page--other'
            );
        }
      }

      log.info('Calling service.getPage: Start');
      const getPageResult = await service.getPage(id);
      log.info('Calling service.getPage: Finish');
      if (getPageResult.ok) {
        return resultOk({
          status: 'success',
          page: getPageResult.value.page,
        });
      }
      // No default case so that we get a TypeScript error if a new error type is added.
      // eslint-disable-next-line default-case
      switch (getPageResult.errorType) {
        case 'service--get-page--invalid-auth':
          return resultOk({
            status: 'invalid-auth',
          });
        case 'service--get-page--no-page-access':
          return resultOk({
            status: 'no-page-access',
          });
        case 'service--get-page--other':
          return resultError(
            'Could not verify page access',
            'usecase--verify-page--other'
          );
      }
    },
  };
  return VerifyPage;
};

export type {VerifyPageInteractor, VerifyPageRepo, VerifyPageService};
export {newVerifyPageInteractor};
