import { describe, it, expect } from 'vitest';
import { DuplicateEmailError, WrongPasswordError } from './models';

describe('DuplicateEmailError', () => {
  it('has correct message', () => {
    const err = new DuplicateEmailError();
    expect(err.message).toBe('A user with that email already exists.');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('WrongPasswordError', () => {
  it('has correct message', () => {
    const err = new WrongPasswordError();
    expect(err.message).toBe('Old password is incorrect.');
    expect(err).toBeInstanceOf(Error);
  });
});
