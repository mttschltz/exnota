import OptionsSync from 'webext-options-sync';

const options = new OptionsSync({
  defaults: {
    notionIntegrationToken: '',
  },
  logging: true,

  // List of functions that are called when the extension is updated
  // migrations: [
  // Integrated utility that drops any properties that don't appear in the defaults
  // OptionsSync.migrations.removeUnused,
  // ],
});

export {options};
