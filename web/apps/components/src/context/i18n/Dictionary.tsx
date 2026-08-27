import React, { ReactNode } from 'react';

export interface Dictionary {
  locale: string;
  translate(key: string, params?: Record<string, unknown>): string;
  interpolate(
    key: string,
    params?: Record<string, ReactNode>,
    options?: { fallback?: string },
  ): React.ReactNode;
}

export class SimpleDictionary implements Dictionary {
  readonly locale: string;
  private translations: Record<string, string>;

  constructor(_locale: string, translations: Record<string, string> = {}) {
    this.locale = _locale;
    this.translations = translations;
  }
  translate(
    key: string,
    params: Record<string, unknown> = {},
    options?: { fallback?: string },
  ): string {
    let template = this.translations[key];
    if (!template) {
      if (options?.fallback) {
        return options.fallback;
      }
      return `**${key}**`;
    }
    for (const [paramKey, paramValue] of Object.entries(params)) {
      const placeholder = new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g');
      template = template.replace(placeholder, String(paramValue));
    }
    return template;
  }

  interpolate(
    key: string,
    params: Record<string, ReactNode> = {},
    options?: { fallback?: string },
  ): React.ReactNode {
    const template = this.translations[key];
    if (!template) {
      if (options?.fallback) {
        return (
          <span data-i18n-key={key} data-fallback>
            {options.fallback}
          </span>
        );
      }
      return (
        <span data-i18n-key={key} data-missing>
          **{key}**
        </span>
      );
    }
    const pieces = template.split(/(\{\{.+?\}\})/g);
    const translated = pieces.map((piece, index) => {
      const match = piece.match(/^\{\{(.+?)\}\}$/);
      if (match) {
        const paramKey = match[1];
        const paramValue = params[paramKey];
        return <React.Fragment key={index}>{paramValue}</React.Fragment>;
      } else {
        return <React.Fragment key={index}>{piece}</React.Fragment>;
      }
    });
    return <span data-i18n-key={key}>{translated}</span>;
  }
}
