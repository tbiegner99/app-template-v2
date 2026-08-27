import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { LanguageSelector, Language } from './LanguageSelector';
import { TranslationsContext } from '../../../context/TranslationsProvider';
import { SimpleDictionary } from '../../../context/i18n/Dictionary';

const mockI18n = {
  dictionary: new SimpleDictionary('en'),
  setLocale: vi.fn(),
  locale: 'en',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TranslationsContext.Provider value={mockI18n}>
    {children}
  </TranslationsContext.Provider>
);

describe('LanguageSelector', () => {
  it('renders language button', () => {
    render(<LanguageSelector value="en" />, { wrapper });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens menu on click', () => {
    render(<LanguageSelector value="en" />, { wrapper });
    act(() => screen.getByRole('button').click());
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('calls onChange and setLocale when language selected', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="en" onChange={onChange} />, { wrapper });
    act(() => screen.getByRole('button').click());
    act(() => screen.getByText('Español').click());
    expect(onChange).toHaveBeenCalledWith('es');
    expect(mockI18n.setLocale).toHaveBeenCalledWith('es');
  });

  it('renders only specified languages', () => {
    render(<LanguageSelector value="en" languages={[Language.EN, Language.FR]} />, { wrapper });
    act(() => screen.getByRole('button').click());
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.queryByText('Español')).not.toBeInTheDocument();
  });
});
