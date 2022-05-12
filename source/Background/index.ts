import {browser} from 'webextension-polyfill-ts';
import {options} from '../util/options';
import {translate} from '../util/i18n';

browser.runtime.onInstalled.addListener((): void => {
  console.log(translate('common:install.successLog'));
  browser.runtime.openOptionsPage();
});

export {options};
