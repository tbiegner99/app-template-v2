import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ThemeProvider, TranslationsProvider } from '@__SLUG__/components';
import translations from './i18n/translations.json';
import esTranslations from './i18n/translations.es.json';
import { SuperTokensWrapper } from './config/supertokens';
import { UserContextProvider } from './context/UserContext';
import AppRoutes from './routes';

const root = document.getElementById('root');

const locales: Record<string, { locale: string; dictionary: Record<string, string> }> = {
  en: translations,
  es: esTranslations,
};

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <TranslationsProvider
        fallbackTranslations={locales.en.dictionary}
        service={{
          loadTranslations: async (locale) => {
            const lang = locale.split('-')[0];
            return (locales[lang] || locales['en']).dictionary;
          },
        }}
      >
        <SuperTokensWrapper>
          <UserContextProvider>
            <AppRoutes />
          </UserContextProvider>
        </SuperTokensWrapper>
      </TranslationsProvider>
    </ThemeProvider>
  </StrictMode>
);
