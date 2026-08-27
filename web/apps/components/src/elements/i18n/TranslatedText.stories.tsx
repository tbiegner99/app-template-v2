import { Meta } from '@storybook/react';
import { TranslationsProvider, useI18n } from '../../context/TranslationsProvider';
import { TranslatedText } from './TranslatedText';
import { PrimaryButton } from '../buttons';
import { FlexRow } from '../containers';

const fallback = {
  greeting: 'Hello, {{name}}!',
  welcome: 'Welcome to MineSafety',
  item_count: 'You have {{count}} items',
};

const frKeys = {
  greeting: 'Bonjour, {{name}}!',
  welcome: 'Bienvenue à MineSafety',
};

const esKeys = {
  greeting: '¡Hola, {{name}}!',
  welcome: 'Bienvenido a MineSafety',
  item_count: 'Tienes {{count}} artículos',
};
const enOverrides = {
  greeting: 'Hi there, {{name}}!',
};

const service = {
  loadTranslations: async (_locale: string) => {
    // no remote translations for story; rely on fallback
    return {};
  },
};

type Args = {
  i18nKey: string;
  name?: string;
  count?: number;
};

const meta: Meta<Args> = {
  title: 'elements/i18n/TranslatedText',
  tags: ['autodocs'],
  args: {
    i18nKey: 'greeting',
    name: 'Alice',
    count: 3,
  },
  argTypes: {
    i18nKey: { control: 'text' },
    name: { control: 'text' },
    count: { control: { type: 'number', min: 0 } },
  },
};

export default meta;

export const Default = (args: Args) => (
  <TranslationsProvider service={service} fallbackTranslations={fallback}>
    <div style={{ padding: 12 }}>
      <TranslatedText
        i18nKey={args.i18nKey}
        params={{ name: <b>{args.name}</b>, count: args.count }}
      />
    </div>
  </TranslationsProvider>
);

export const MissingKey = () => (
  <TranslationsProvider service={service} fallbackTranslations={fallback}>
    <div style={{ padding: 12 }}>
      <TranslatedText i18nKey="not.a.real.key" />
    </div>
  </TranslationsProvider>
);

const SwitchLanquages = () => {
  const { setLocale } = useI18n();
  return (
    <FlexRow gap={12}>
      <PrimaryButton
        onClick={() => {
          setLocale('en');
        }}
      >
        English
      </PrimaryButton>
      <PrimaryButton
        onClick={() => {
          setLocale('es');
        }}
      >
        Spanish
      </PrimaryButton>
      <PrimaryButton
        onClick={() => {
          setLocale('fr');
        }}
      >
        French
      </PrimaryButton>
    </FlexRow>
  );
};

export const UpdateLocale = (args: Args) => (
  <TranslationsProvider
    service={{
      loadTranslations: async (locale: string) => {
        if (locale === 'es') {
          return esKeys;
        }
        if (locale === 'fr') {
          return frKeys;
        }
        return enOverrides;
      },
    }}
    fallbackTranslations={fallback}
  >
    <div style={{ padding: 12 }}>
      <TranslatedText
        i18nKey={args.i18nKey}
        params={{ name: <b>{args.name}</b>, count: args.count }}
      />
    </div>
    <SwitchLanquages />
  </TranslationsProvider>
);
