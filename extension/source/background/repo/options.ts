import {createLog, unknownError} from '@lib/log';
import {resultError, resultOk} from '@lib/result';
import {OptionsConfigRepo} from '@background/repo';
import {newOptionsConfig, OptionsConfig} from '@background/optionsConfig';
import {newPage} from '@background/page';
import {has} from '@lib/type';
import {REPO_KEY} from './config';

const OPTIONS_REPO_KEY = Object.freeze({
  PAGE: 'page',
});

const newOptionsRepo = (storage: LocalForage): OptionsConfigRepo => {
  const getConfig: OptionsConfigRepo['getConfig'] = async () => {
    const log = createLog('background', 'GetConfigOptionsRepo');
    try {
      log.info('Calling storage.getItem: Start');
      const optionsConfigRaw = await storage.getItem(REPO_KEY.OPTIONS_CONFIG);
      log.info('Calling storage.getItem: Finish');

      if (optionsConfigRaw === null || optionsConfigRaw === undefined) {
        log.info('Options config not found in storage');
        return resultOk(undefined);
      }

      // TODO: Update to use the const for property name
      if (has(optionsConfigRaw, OPTIONS_REPO_KEY.PAGE)) {
        const {page} = optionsConfigRaw;

        // Must have ID
        let id: string | undefined;
        if (has(page, 'id') && typeof page.id === 'string') {
          id = page.id;
        }
        // Must have title
        let title: string | undefined;
        if (has(page, 'title') && typeof page.title === 'string') {
          title = page.title;
        }
        // Must have url
        let url: string | undefined;
        if (has(page, 'url') && typeof page.url === 'string') {
          url = page.url;
        }

        if (id && title && url) {
          const pageResult = newPage(id, title, url);
          if (pageResult.ok) {
            log.info('Options config constructed from storage');
            return resultOk(newOptionsConfig(pageResult.value));
          }
          log.info(
            `Options config could not be constructed from storage due to page error`
          );
          return resultOk(undefined);
        }
      }

      log.info('Options config could not be constructed from storage');
      return resultOk(undefined);
    } catch (e) {
      log.error('Could not get options config', unknownError(e));
      if (e instanceof Error) {
        return resultError('Could not get options config', 'storage-get', e);
      }
      return resultError('Could not get options config', 'storage-get');
    }
  };

  const saveConfig: OptionsConfigRepo['saveConfig'] = async (
    optionsConfig: OptionsConfig
  ) => {
    const log = createLog('background', 'SaveConfigOptionsRepo');
    try {
      log.info('Calling storage.setItem: Start');
      await storage.setItem(REPO_KEY.OPTIONS_CONFIG, {
        [OPTIONS_REPO_KEY.PAGE]: {
          id: optionsConfig.page.id,
          title: optionsConfig.page.title,
          url: optionsConfig.page.url,
        },
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
    getConfig,
  };
};

export {newOptionsRepo};
