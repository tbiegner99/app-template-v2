import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Grid, GridItem } from './Grid';

describe('Grid', () => {
  it('renders children', () => {
    render(<Grid><span>grid item</span></Grid>);
    expect(screen.getByText('grid item')).toBeInTheDocument();
  });

  it('applies numeric templateColumns as repeat()', () => {
    const { container } = render(<Grid templateColumns={3}>child</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
  });

  it('applies string templateColumns directly', () => {
    const { container } = render(<Grid templateColumns="1fr 2fr">child</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateColumns).toBe('1fr 2fr');
  });

  it('applies numeric templateRows as repeat()', () => {
    const { container } = render(<Grid templateRows={2}>child</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateRows).toBe('repeat(2, auto)');
  });

  it('applies gap', () => {
    const { container } = render(<Grid gap={16}>child</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gap).toBe('16px');
  });

  it('applies rowGap and columnGap', () => {
    const { container } = render(<Grid rowGap={8} columnGap={12}>child</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.rowGap).toBe('8px');
    expect(el.style.columnGap).toBe('12px');
  });

  it('applies alignItems', () => {
    const { container } = render(<Grid alignItems="center">child</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.alignItems).toBe('center');
  });

  it('applies areas as grid-template-areas', () => {
    const { container } = render(<Grid areas={['header', 'content', 'footer']}>child</Grid>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridTemplateAreas).toContain('header');
  });
});

describe('GridItem', () => {
  it('applies numeric column as col / col+1', () => {
    const { container } = render(<GridItem column={2}>item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridColumn).toBe('2 / 3');
  });

  it('applies string column directly', () => {
    const { container } = render(<GridItem column="1 / 3">item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridColumn).toBe('1 / 3');
  });

  it('applies columnStart and columnEnd', () => {
    const { container } = render(<GridItem columnStart={1} columnEnd={3}>item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridColumn).toBe('1 / 3');
  });

  it('applies columnStart without columnEnd', () => {
    const { container } = render(<GridItem columnStart={2}>item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridColumn).toBe('2 / auto');
  });

  it('applies numeric row as row / row+1', () => {
    const { container } = render(<GridItem row={1}>item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridRow).toBe('1 / 2');
  });

  it('applies string row directly', () => {
    const { container } = render(<GridItem row="1 / span 2">item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridRow).toBe('1 / span 2');
  });

  it('applies rowStart and rowEnd', () => {
    const { container } = render(<GridItem rowStart={2} rowEnd={4}>item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridRow).toBe('2 / 4');
  });

  it('applies area', () => {
    const { container } = render(<GridItem area="header">item</GridItem>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.gridArea).toBe('header');
  });

  it('renders children', () => {
    render(<GridItem><span>content</span></GridItem>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
