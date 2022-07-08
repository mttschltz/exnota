import {createLog} from '@lib/log';
import {Errors, Result, resultOk} from '@lib/result';
import {OptionsConfigRepo} from '@background/repo';
import {newOptionsConfig, OptionsConfig} from '@background/optionsConfig';
import {newPage} from '@background/page';

type SetPageError = Errors<
  typeof newPage,
  Errors<OptionsConfigRepo['getConfig'], OptionsConfigRepo['saveConfig']>
>;

interface SetPageRepo {
  saveOptionsConfig: OptionsConfigRepo['saveConfig'];
  getOptionsConfig: OptionsConfigRepo['getConfig'];
}

const log = createLog('background', 'SetPageUsecase');

interface SetPageInteractor {
  readonly setPage: (
    id: string,
    name: string
  ) => Promise<Result<void, SetPageError>>;
}

const newSetPageInteractor = (repo: SetPageRepo): SetPageInteractor => {
  const SetPage: SetPageInteractor = {
    async setPage(id, name) {
      // get options config
      log.info('Calling repo.getOptionsConfig: Start');
      const optionsConfigResult = await repo.getOptionsConfig();
      if (!optionsConfigResult.ok) {
        return optionsConfigResult;
      }
      log.info('Calling repo.getOptionsConfig: Finish');

      // update page in options config or create new config
      log.info('Creating or update options config: Start');
      const pageResult = newPage(id, name);
      if (!pageResult.ok) {
        return pageResult;
      }
      let optionsConfig: OptionsConfig;
      if (!optionsConfigResult.value) {
        optionsConfig = newOptionsConfig(pageResult.value);
      } else {
        optionsConfig = optionsConfigResult.value;
        optionsConfig.setPage(pageResult.value);
      }
      log.info('Creating or update options config: Finish');

      // persist options
      log.info('Calling repo.saveOptionsConfig: Start');
      const saveOptionsResult = await repo.saveOptionsConfig(optionsConfig);
      if (!saveOptionsResult.ok) {
        return saveOptionsResult;
      }
      log.info('Calling repo.saveOptionsConfig: Finish');

      return resultOk(undefined);
    },
  };
  return SetPage;
};

export type {SetPageInteractor, SetPageRepo};
export {newSetPageInteractor};
