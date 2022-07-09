import {createLog} from '@lib/log';
import {Errors, Result, resultOk} from '@lib/result';
import {OptionsConfigRepo} from '@background/repo';
import {newPage, Page} from '@background/page';

type VerifyPageError = Errors<
  Errors<typeof newPage, 'error-verifying-page'>,
  Errors<OptionsConfigRepo['getConfig']>
>;

type VerifyPageResponse =
  | {
      status: 'success';
      page: Page;
    }
  | {status: 'not-found' | 'no-access' | 'no-page'};

interface VerifyPageRepo {
  getOptionsConfig: OptionsConfigRepo['getConfig'];
}

interface VerifyPageService {
  verifyPage: (
    id: string
  ) => Promise<Result<VerifyPageResponse, VerifyPageError>>;
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
    async verifyPage() {
      // get options config
      log.info('Calling repo.getOptionsConfig: Start');
      const optionsConfigResult = await repo.getOptionsConfig();
      if (!optionsConfigResult.ok) {
        return optionsConfigResult;
      }
      log.info('Calling repo.getOptionsConfig: Finish');

      // if no page id, return error or status
      const id = optionsConfigResult.value?.page?.id;
      if (!id) {
        return resultOk({
          status: 'no-page',
        });
      }

      // get page from notion
      log.info('Calling service.verifyPage: Start');
      const verifyPageResult = await service.verifyPage(id);
      log.info('Calling service.verifyPage: Finish');
      if (!verifyPageResult.ok) {
        log.info('Calling service.verifyPage: Error');
        return verifyPageResult;
      }

      return verifyPageResult;
    },
  };
  return VerifyPage;
};

export type {VerifyPageInteractor, VerifyPageRepo};
export {newVerifyPageInteractor};
