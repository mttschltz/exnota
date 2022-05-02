import {browser} from 'webextension-polyfill-ts';
import OptionsSync from 'webext-options-sync';

const options = new OptionsSync({
  defaults: {
    colorString: 'green',
    anyBooleans: true,
    numbersAreFine: 9001,
  },

  // List of functions that are called when the extension is updated
  // migrations: [
  // Integrated utility that drops any properties that don't appear in the defaults
  // OptionsSync.migrations.removeUnused,
  // ],
});

browser.runtime.onInstalled.addListener((): void => {
  console.log(browser.i18n.getMessage('installationLog'));
  browser.runtime.openOptionsPage();
});

export {options};
