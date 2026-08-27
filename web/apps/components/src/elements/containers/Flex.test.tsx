import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { FlexRow, FlexColumn } from './Flex';

describe('FlexRow', () => {
  it('renders children', () => {
    render(<FlexRow><span>content</span></FlexRow>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('applies flex-direction row', () => {
    const { container } = render(<FlexRow>child</FlexRow>);
    expect(container.firstChild).toHaveStyle({ flexDirection: 'row' });
  });

  it('applies gap', () => {
    const { container } = render(<FlexRow gap={8}>child</FlexRow>);
    expect(container.firstChild).toHaveStyle({ gap: '8px' });
  });

  it('applies align center', () => {
    const { container } = render(<FlexRow align="center">child</FlexRow>);
    expect(container.firstChild).toHaveStyle({ alignItems: 'center' });
  });

  it('applies justify between', () => {
    const { container } = render(<FlexRow justify="between">child</FlexRow>);
    expect(container.firstChild).toHaveStyle({ justifyContent: 'space-between' });
  });

  it('applies wrap', () => {
    const { container } = render(<FlexRow wrap>child</FlexRow>);
    expect(container.firstChild).toHaveStyle({ flexWrap: 'wrap' });
  });

  it('applies grow', () => {
    const { container } = render(<FlexRow grow>child</FlexRow>);
    expect(container.firstChild).toHaveStyle({ flexGrow: '1' });
  });

  it('applies shrink', () => {
    const { container } = render(<FlexRow shrink>child</FlexRow>);
    expect(container.firstChild).toHaveStyle({ flexShrink: '1' });
  });

  it.each(['start', 'end', 'stretch', 'baseline'] as const)('maps align %s correctly', (align) => {
    const { container } = render(<FlexRow align={align}>child</FlexRow>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.alignItems).toBeTruthy();
  });

  it.each(['start', 'center', 'end', 'around', 'evenly'] as const)('maps justify %s correctly', (justify) => {
    const { container } = render(<FlexRow justify={justify}>child</FlexRow>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.justifyContent).toBeTruthy();
  });
});

describe('FlexColumn', () => {
  it('renders children', () => {
    render(<FlexColumn><span>col content</span></FlexColumn>);
    expect(screen.getByText('col content')).toBeInTheDocument();
  });

  it('applies flex-direction column', () => {
    const { container } = render(<FlexColumn>child</FlexColumn>);
    expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
  });

  it('applies align and justify', () => {
    const { container } = render(<FlexColumn align="end" justify="evenly">child</FlexColumn>);
    expect(container.firstChild).toHaveStyle({ alignItems: 'flex-end', justifyContent: 'space-evenly' });
  });
});
