import {browser} from 'webextension-polyfill-ts';
import OptionsSync from 'webext-options-sync';
import {translate} from '@background/ui/i18n/i18n';
import {newOptionsRepo} from '@background/repo/options';
import {createLog} from '@lib/log';
import {
  startGetTokenListener,
  startSetTokenListener,
} from '@background/service/api/token';

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