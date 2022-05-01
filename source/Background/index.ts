import {browser} from 'webextension-polyfill-ts';

browser.runtime.onInstalled.addListener((): void => {
  console.log(browser.i18n.getMessage('installationLog'));
  browser.runtime.openOptionsPage();
});
