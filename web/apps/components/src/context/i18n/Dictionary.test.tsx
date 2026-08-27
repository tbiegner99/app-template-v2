import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { SimpleDictionary } from './Dictionary';

describe('SimpleDictionary', () => {
  const dict = new SimpleDictionary('en', {
    'greeting': 'Hello, {{name}}!',
    'simple': 'Just a string',
  });

  describe('translate()', () => {
    it('returns translated string with interpolation', () => {
      expect(dict.translate('greeting', { name: 'World' })).toBe('Hello, World!');
    });

    it('returns simple string without params', () => {
      expect(dict.translate('simple')).toBe('Just a string');
    });

    it('returns **key** for missing key', () => {
      expect(dict.translate('missing')).toBe('**missing**');
    });

    it('returns fallback for missing key when provided', () => {
      expect(dict.translate('missing', {}, { fallback: 'fallback text' })).toBe('fallback text');
    });
  });

  describe('interpolate()', () => {
    it('renders missing key with fallback', () => {
      render(<>{dict.interpolate('missing', {}, { fallback: 'Fallback' })}</>);
      expect(screen.getByText('Fallback')).toBeInTheDocument();
    });

    it('renders missing key placeholder when no fallback', () => {
      const { container } = render(<>{dict.interpolate('missing.key')}</>);
      expect(container.querySelector('[data-missing]')).toBeInTheDocument();
    });

    it('renders translated text with React node params', () => {
      const result = dict.interpolate('greeting', { name: <strong key="n">World</strong> });
      const { container } = render(<>{result}</>);
      expect(container.querySelector('[data-i18n-key="greeting"]')).toBeInTheDocument();
    });

    it('renders translated text for known key', () => {
      const result = dict.interpolate('simple');
      render(<>{result}</>);
      expect(screen.getByText('Just a string')).toBeInTheDocument();
    });
  });

  describe('locale', () => {
    it('exposes the locale', () => {
      expect(dict.locale).toBe('en');
    });
  });
});
