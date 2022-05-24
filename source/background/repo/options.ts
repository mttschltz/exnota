import WebExtOptionsSync from 'webext-options-sync';
import {createLog, unknownError} from '../../util/log';
import {resultError, resultOk} from '../../util/result';
import type {OptionsJson} from '../options';
import {newOptions} from '../options';
import {OptionsRepo} from '../repo';

type OptionsSync = WebExtOptionsSync<OptionsJson>;

const newOptionsRepo = (optionsSync: OptionsSync): OptionsRepo => {
  const getOptions: OptionsRepo['getOptions'] = async () => {
    const log = createLog('background', 'GetOptionsRepo');
    try {
      log.info('Calling optionsSync.getAll: Start');
      const values = await optionsSync.getAll();
      log.info('Calling optionsSync.getAll: Finish');

      return resultOk(newOptions(values));
    } catch (e) {
      log.error('Could not get options from OptionsSync', unknownError(e));
      if (e instanceof Error) {
        return resultError(
          'Could not get options from OptionsSync',
          'options-sync',
          e
        );
      }
      return resultError(
        'Could not get options from OptionsSync',
        'options-sync'
      );
    }
  };
  const setNotionIntegrationToken: OptionsRepo['setNotionIntegrationToken'] =
    async (notionIntegrationToken: string) => {
      const log = createLog('background', 'SetNotionIntegrationTokenRepo');
      let values: OptionsJson;
      try {
        values = await optionsSync.getAll();
      } catch (e) {
        log.error('Could not get options from OptionsSync', unknownError(e));
        if (e instanceof Error) {
          return resultError(
            'Could not get options from OptionsSync',
            'options-sync',
            e
          );
        }
        return resultError(
          'Could not get options from OptionsSync',
          'options-sync'
        );
      }

      try {
        log.info('Creating options: Start');
        const options = newOptions(values);
        const result = options.setNotionIntegrationToken(
          notionIntegrationToken
        );
        log.info('Creating options: Finish');

        if (!result.ok) {
          log.info('Creating options: Error');
          return result;
        }

        log.info('Setting integration token in options: Start');
        await optionsSync.set({
          notionIntegrationToken,
        });
        log.info('Setting integration token in options: Finish');

        return resultOk(options);
      } catch (e) {
        log.info('Setting integration token in options: Error');
        if (e instanceof Error) {
          return resultError(
            'Could not set notion integration toke',
            'options-sync',
            e
          );
        }
        return resultError(
          'Could not set notion integration toke',
          'options-sync'
        );
      }
    };

  return {
    getOptions,
    setNotionIntegrationToken,
  };
};

export {newOptionsRepo};
