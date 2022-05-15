import {browser} from 'webextension-polyfill-ts';
import {startGetTokenListener, listen as notionListen} from './message/notion';
import {options} from '../util/options';
import {translate} from '../util/i18n';

// TODO: Move this file into source/background/service?

browser.runtime.onInstalled.addListener((): void => {
  console.log(translate('common:install.successLog'));
  browser.runtime.openOptionsPage();
});

notionListen();
startGetTokenListener()

export {options};
