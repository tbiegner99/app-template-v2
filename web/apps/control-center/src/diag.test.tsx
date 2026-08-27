import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { LoadingState } from '@__SLUG__/components';

describe('diag', () => {
  it('prints state value', () => {
    const s = LoadingState.unloaded();
    console.log('state value:', JSON.stringify(s.state));
    console.log('state type:', typeof s.state);
    const T = () => <span data-testid="x">{s.state}</span>;
    render(<T />);
    console.log('rendered text:', screen.getByTestId('x').textContent);
  });
});
