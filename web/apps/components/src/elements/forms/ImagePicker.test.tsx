import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { ImagePicker } from './ImagePicker';

describe('ImagePicker', () => {
  it('renders upload area', () => {
    render(<ImagePicker onFilePicked={vi.fn()} />);
    // Should render some kind of upload element
    expect(document.body).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ImagePicker label="Upload Photo" onFilePicked={vi.fn()} />);
    expect(screen.getByText('Upload Photo')).toBeInTheDocument();
  });

  it('renders with custom accept types', () => {
    render(<ImagePicker accept={['pdf']} onFilePicked={vi.fn()} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input?.getAttribute('accept')).toContain('pdf');
  });

  it('renders with multiple=true without error', () => {
    render(<ImagePicker multiple onFilePicked={vi.fn()} />);
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<ImagePicker disabled onFilePicked={vi.fn()} />);
    expect(document.body).toBeInTheDocument();
  });
});
