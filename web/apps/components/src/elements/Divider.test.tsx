import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a divider element', () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
