import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { TranslatedText } from './TranslatedText';
import { TranslationsContext } from '../../context/TranslationsProvider';
import { SimpleDictionary } from '../../context/i18n/Dictionary';

const dict = new SimpleDictionary('en', { 'hello': 'Hello, {{name}}!', 'simple': 'Hello World' });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TranslationsContext.Provider value={{ dictionary: dict, setLocale: () => {}, locale: 'en' }}>
    {children}
  </TranslationsContext.Provider>
);

describe('TranslatedText', () => {
  it('renders translated text', () => {
    render(<TranslatedText i18nKey="simple" />, { wrapper });
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders with params', () => {
    render(<TranslatedText i18nKey="hello" params={{ name: 'World' }} />, { wrapper });
    // SimpleDictionary.interpolate returns a React element with data-i18n-key
    expect(document.querySelector('[data-i18n-key="hello"]')).toBeInTheDocument();
  });
});
