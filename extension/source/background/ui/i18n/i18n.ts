import i18n from 'i18next';
import {
  initReactI18next,
  TFunction,
  Trans,
  useTranslation,
} from 'react-i18next';
import common from './en/common.json';
import setup from './en/setup.json';

const resources = {
  en: {
    common,
    setup,
  },
} as const;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources,
    lng: 'en', // if you're using a language detector, do not define the lng option
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

type Namespace = Exclude<keyof typeof resources['en'], 'common'>;

const useTranslate = <T extends Namespace>(
  x: T[]
): TFunction<(T | 'common')[]> => {
  const [t] = useTranslation([...x, 'common']);
  return t;
};

const translate: TFunction<(keyof typeof resources['en'])[]> = (key) => {
  return i18n.t(key);
};

export {useTranslate, resources, translate, Trans as Translate};
