import React from 'react';
import { Dictionary, SimpleDictionary } from './i18n/Dictionary';
import { LoadingState } from '../utils/LoadingState';
export interface TranslationsService {
  loadTranslations: (locale: string) => Promise<Record<string, string>>;
}

export interface Translations {
  dictionary: Dictionary;
  setLocale: (locale: string) => void;
  locale: string;
}

export const TranslationsContext = React.createContext<Translations>({
  dictionary: new SimpleDictionary('en'),
  setLocale: () => {},
  locale: 'en',
});

export const useI18n = () => {
  return React.useContext(TranslationsContext);
};

export const TranslationsProvider: React.FC<{
  fallbackTranslations: Record<string, string>;

  service: TranslationsService;
  children: React.ReactNode;
}> = ({ service, fallbackTranslations, children }) => {
  const [locale, setLocale] = React.useState(window.navigator.language || 'en');
  const [dictionary, setDictionary] = React.useState<LoadingState<Dictionary>>(
    LoadingState.notLoaded(),
  );
  const loadDictionary = React.useCallback(
    async (locale: string) => {
      try {
        const translations = await service.loadTranslations(locale);
        setDictionary(
          LoadingState.loaded(
            new SimpleDictionary(locale, {
              ...fallbackTranslations,
              ...translations,
            }),
          ),
        );
      } catch (error) {
        console.error(
          `Failed to load translations for locale "${locale}", falling back to default.`,
          error,
        );
        setDictionary(LoadingState.loaded(new SimpleDictionary(locale, fallbackTranslations)));
      }
    },
    [service, fallbackTranslations],
  );
  React.useEffect(() => {
    loadDictionary(locale);
  }, [locale]);

  return (
    <TranslationsContext.Provider
      value={{
        dictionary: dictionary.hasData()
          ? dictionary.data!
          : new SimpleDictionary('en', fallbackTranslations),
        setLocale,
        locale,
      }}
    >
      {dictionary.hasData() ? children : null}
    </TranslationsContext.Provider>
  );
};
