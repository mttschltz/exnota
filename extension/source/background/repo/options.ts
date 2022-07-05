import {createLog, unknownError} from '@lib/log';
import {resultError, resultOk} from '@lib/result';
import {OptionsConfigRepo} from '@background/repo';
import {OptionsConfig} from '@background/optionsConfig';
import {REPO_KEY} from './config';

const OPTIONS_REPO_KEY = Object.freeze({
  PAGE: 'page',
});

const newOptionsRepo = (storage: LocalForage): OptionsConfigRepo => {
  // TODO: Implement
  // const getConfig: AuthConfigRepo['getConfig'] = async () => {
  //   const log = createLog('background', 'GetConfigAuthRepo');
  //   try {
  //     log.info('Calling storage.getItem: Start');
  //     const authConfigRaw = await storage.getItem(REPO_KEY.AUTH_CONFIG);
  //     log.info('Calling storage.getItem: Finish');

  //     if (isAuthConfig(authConfigRaw)) {
  //       const authConfigResult = newAuthConfig(
  //         authConfigRaw.code,
  //         authConfigRaw.tokenResponse
  //       );
  //       return authConfigResult;
  //     }

  //     return resultOk(undefined);
  //   } catch (e) {
  //     log.error('Could not get auth config', unknownError(e));
  //     if (e instanceof Error) {
  //       return resultError('Could not get auth config', 'storage-get', e);
  //     }
  //     return resultError('Could not get auth config', 'storage-get');
  //   }
  // };

  const saveConfig: OptionsConfigRepo['saveConfig'] = async (
    optionsConfig: OptionsConfig
  ) => {
    const log = createLog('background', 'SaveConfigOptionsRepo');
    try {
      log.info('Calling storage.setItem: Start');
      await storage.setItem(REPO_KEY.OPTIONS_CONFIG, {
        [OPTIONS_REPO_KEY.PAGE]: optionsConfig.page,
      });
      log.info('Calling storage.setItem: Finish');

      return resultOk(undefined);
    } catch (e) {
      log.error('Could not set options config', unknownError(e));
      if (e instanceof Error) {
        return resultError('Could not set options config', 'storage-set', e);
      }
      return resultError('Could not set options config', 'storage-set');
    }
  };

  return {
    saveConfig,
  };
};

export {newOptionsRepo};
