import {browser} from 'webextension-polyfill-ts';
import {startGetTokenListener, listen as notionListen} from './message/notion';
import {options} from '../util/options';
import {translate} from '../util/i18n';
import { newOptionsRepo } from './repo/options';
import OptionsSync from 'webext-options-sync';

// TODO: Move this file into source/background/service?

browser.runtime.onInstalled.addListener((): void => {
  console.log(translate('common:install.successLog'));
  browser.runtime.openOptionsPage();
});

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
)
startGetTokenListener(optionsRepo)
notionListen(); // TODO: Remove

export {options};
