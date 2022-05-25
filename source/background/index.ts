import {browser} from 'webextension-polyfill-ts';
import OptionsSync from 'webext-options-sync';
import {startGetTokenListener, startSetTokenListener} from './service/api/notion';
import {translate} from '../util/i18n';
import {newOptionsRepo} from './repo/options';
import {createLog} from '../util/log';

// TODO: Move this file into source/background/service?

const log = createLog('background', 'Index');

log.info('Creating onInstall listener');
browser.runtime.onInstalled.addListener((): void => {
  console.log(translate('common:install.successLog'));
  browser.runtime.openOptionsPage();
});

log.info('Creating options repo');
const optionsRepo = newOptionsRepo(
  new OptionsSync({
    defaults: {
      notionIntegrationToken: '',
    },
    logging: true,

    // List of functions that are called when the extension is updated
    // migrations: [
    // Integrated utility that drops any properties that don't appear in the defaults
    // OptionsSync.migrations.removeUnused,
    // ],
  })
);

log.info('Starting get token listener');
startGetTokenListener(optionsRepo);

log.info('Starting set token listener');
startSetTokenListener(optionsRepo);
