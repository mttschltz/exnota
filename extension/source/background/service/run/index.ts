import {browser} from 'webextension-polyfill-ts';
import {translate} from '@background/ui/i18n/i18n';
import {newAuthRepo} from '@background/repo/auth';
import {createLog} from '@lib/log';
import {
  startGetClientIdListener,
  startConnectListener,
} from '@background/service/message/auth';
import * as localforage from 'localforage';
import {local as localDriver} from 'localforage-webextensionstorage-driver';
import {newOptionsRepo} from '@background/repo/options';

const log = createLog('background', 'Index');

log.info('Creating onInstall listener');
browser.runtime.onInstalled.addListener((): void => {
  console.log(translate('common:install.successLog'));
  browser.runtime.openOptionsPage();
});

(async function f(): Promise<void> {
  log.info('Creating options repo');
  await localforage.defineDriver(localDriver);
  const extensionStorage = localforage.createInstance({
    driver: 'webExtensionLocalStorage',
  });
  const authRepo = newAuthRepo(extensionStorage);
  const optionsRepo = newOptionsRepo(extensionStorage);

  log.info('Starting get client ID listener');
  startGetClientIdListener();

  log.info('Starting connect listener');
  startConnectListener({
    getAuthConfig: authRepo.getConfig,
    saveAuthConfig: authRepo.saveConfig,
    saveOptionsConfig: optionsRepo.saveConfig,
  });
})();
