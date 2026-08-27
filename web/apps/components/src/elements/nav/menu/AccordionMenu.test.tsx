import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { AccordionMenu } from './AccordionMenu';

describe('AccordionMenu', () => {
  const items = [
    { label: 'Item 1' },
    { label: 'Item 2' },
  ];

  it('renders title', () => {
    render(<AccordionMenu title="Section" items={items} />);
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('starts collapsed by default', () => {
    render(<AccordionMenu title="Section" items={items} />);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('starts open when defaultOpen=true', () => {
    render(<AccordionMenu title="Section" items={items} defaultOpen />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('toggles open on click', () => {
    render(<AccordionMenu title="Section" items={items} />);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    act(() => {
      screen.getByRole('button').click();
    });
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(<AccordionMenu title="Section" icon={<span data-testid="icon">★</span>} items={[]} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with empty items', () => {
    render(<AccordionMenu title="Empty" items={[]} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
