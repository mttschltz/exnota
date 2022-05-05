import i18n from 'i18next';
import {initReactI18next, TFunction, useTranslation} from 'react-i18next';
import appTranslations from '../_locales/en/app.json';

const resources = {
  en: {
    app: appTranslations,
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

type Namespace = keyof typeof resources['en'];

const useTranslate = <T extends Namespace>(x: T): TFunction<T[]> => {
  const [t] = useTranslation([x]);
  return t;
};

export {useTranslate, resources};
