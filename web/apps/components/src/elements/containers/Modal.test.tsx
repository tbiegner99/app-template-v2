import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders when open', () => {
    render(<Modal open onClose={vi.fn()}>Modal body</Modal>);
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<Modal open={false} onClose={vi.fn()}>Hidden</Modal>);
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Modal open onClose={vi.fn()} title="My Title">content</Modal>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(
      <Modal open onClose={vi.fn()} actions={<button>Save</button>}>
        content
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows close button by default', () => {
    render(<Modal open onClose={vi.fn()} title="T">content</Modal>);
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('hides close button when disableClose', () => {
    render(<Modal open onClose={vi.fn()} title="T" disableClose>content</Modal>);
    // Only the built-in dialog buttons (none should be close)
    expect(screen.queryByLabelText('close')).not.toBeInTheDocument();
  });
});
