import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { TranslationsProvider, TranslationsContext, useI18n } from './TranslationsProvider';

const mockService = {
  loadTranslations: vi.fn().mockResolvedValue({ 'greeting': 'Hello' }),
};

const fallback = { 'key': 'Fallback value' };

describe('TranslationsProvider', () => {
  it('renders children after translations load', async () => {
    render(
      <TranslationsProvider service={mockService} fallbackTranslations={fallback}>
        <span>App loaded</span>
      </TranslationsProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('App loaded')).toBeInTheDocument();
    });
  });

  it('falls back gracefully when loadTranslations throws', async () => {
    const failService = { loadTranslations: vi.fn().mockRejectedValue(new Error('network error')) };
    render(
      <TranslationsProvider service={failService} fallbackTranslations={fallback}>
        <span>Fallback children</span>
      </TranslationsProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Fallback children')).toBeInTheDocument();
    });
  });
});

describe('TranslationsContext defaults', () => {
  it('provides default context when used outside provider', () => {
    const Consumer = () => {
      const { locale } = useI18n();
      return <span>{locale}</span>;
    };
    render(<Consumer />);
    expect(screen.getByText('en')).toBeInTheDocument();
  });
});
