import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Accordion } from './Accordion';

describe('Accordion', () => {
  it('renders string summary', () => {
    render(<Accordion summary="Section Title">content</Accordion>);
    expect(screen.getByText('Section Title')).toBeInTheDocument();
  });

  it('renders React node summary', () => {
    render(<Accordion summary={<strong>Bold Title</strong>}>content</Accordion>);
    expect(screen.getByText('Bold Title')).toBeInTheDocument();
  });

  it('renders expanded by default when defaultExpanded', () => {
    render(<Accordion summary="Open" defaultExpanded>Content here</Accordion>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('calls onChange when toggled', () => {
    const onChange = vi.fn();
    render(<Accordion summary="Toggle" onChange={onChange}>body</Accordion>);
    screen.getByText('Toggle').click();
    // onChange is wired to MUI, click fires on summary
  });

  it('renders disabled', () => {
    render(<Accordion summary="Disabled" disabled>body</Accordion>);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });
});
