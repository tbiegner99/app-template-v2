import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { SignaturePad } from './SignaturePad';

// Mock canvas context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    fillStyle: '',
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    toDataURL: vi.fn(() => 'data:image/png;base64,xxx'),
  }),
});

describe('SignaturePad', () => {
  it('renders canvas element', () => {
    render(<SignaturePad />);
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<SignaturePad label="Signature" />);
    expect(screen.getByText('Signature')).toBeInTheDocument();
  });

  it('renders with custom dimensions', () => {
    render(<SignaturePad width={600} height={200} />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeInTheDocument();
  });

  it('renders Clear button', () => {
    render(<SignaturePad />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('renders Accept button', () => {
    render(<SignaturePad onAccept={vi.fn()} />);
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  it('calls onAccept with null when isEmpty and accept clicked', () => {
    const onAccept = vi.fn();
    render(<SignaturePad onAccept={onAccept} />);
    screen.getByText('Accept').click();
    expect(onAccept).toHaveBeenCalledWith(null);
  });

  it('clears canvas when Clear clicked', () => {
    render(<SignaturePad />);
    // Just verify it doesn't throw
    screen.getByText('Clear').click();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });
});
