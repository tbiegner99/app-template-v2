import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import {
  H1, H2, H3, H4, H5, H6,
  Title,
  Subtitle, SubtitleSmall,
  Body, BodySmall,
  Caption, Overline,
} from './TextElements';

describe('Text heading elements', () => {
  it.each([
    [H1, 'Heading 1'],
    [H2, 'Heading 2'],
    [H3, 'Heading 3'],
    [H4, 'Heading 4'],
    [H5, 'Heading 5'],
    [H6, 'Heading 6'],
    [Title, 'Title text'],
  ])('renders element with children', (Component, text) => {
    render(<Component>{text}</Component>);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe('Text body elements', () => {
  it.each([
    [Subtitle, 'Subtitle'],
    [SubtitleSmall, 'SubtitleSmall'],
    [Body, 'Body'],
    [BodySmall, 'BodySmall'],
    [Caption, 'Caption'],
    [Overline, 'Overline'],
  ])('renders element with children', (Component, text) => {
    render(<Component>{text}</Component>);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe('Text style props', () => {
  it('applies bold style', () => {
    render(<Body bold>Bold text</Body>);
    expect(screen.getByText('Bold text')).toHaveStyle({ fontWeight: 'bold' });
  });

  it('applies italic style', () => {
    render(<Body italic>Italic text</Body>);
    expect(screen.getByText('Italic text')).toHaveStyle({ fontStyle: 'italic' });
  });

  it('applies strike-through decoration', () => {
    render(<Body strike>Strike</Body>);
    expect(screen.getByText('Strike')).toBeInTheDocument();
  });

  it('applies underline decoration', () => {
    render(<Body underline>Underline</Body>);
    expect(screen.getByText('Underline')).toBeInTheDocument();
  });
});
