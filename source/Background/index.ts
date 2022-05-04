import {browser} from 'webextension-polyfill-ts';
import {options} from '../util/options';

browser.runtime.onInstalled.addListener((): void => {
  console.log(browser.i18n.getMessage('installationLog'));
  browser.runtime.openOptionsPage();
});

export {options};
