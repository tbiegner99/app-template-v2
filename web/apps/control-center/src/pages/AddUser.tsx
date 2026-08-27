import React, { useState } from 'react';
import { H1, Body, Card, FlexColumn, TranslatedText } from '@__SLUG__/components';
import { Page } from '../components/layout/Page';
import { createUser } from '../domains/auth/datasource';
import { DuplicateEmailError } from '../domains/auth/models';
import { setTraceId, ApiError } from '../lib/httpClient';

interface AddUserForm {
  email: string;
  password: string;
  displayName: string;
}

function AddUser() {
  const [form, setForm] = useState<AddUserForm>({ email: '', password: '', displayName: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTraceId(crypto.randomUUID());
    try {
      await createUser(form.email, form.password, form.displayName);
      setSuccess(true);
      setForm({ email: '', password: '', displayName: '' });
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        setError(err.message);
      } else if (err instanceof ApiError) {
        setError(`Failed to create user. Please try again. (ID: ${err.traceId})`);
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title={<TranslatedText i18nKey="controlCenter.auth.addUser.title" />}>
      <Card>
        <FlexColumn gap={2}>
          <H1><TranslatedText i18nKey="controlCenter.auth.addUser.title" /></H1>
          {success && (
            <Body style={{ color: 'green' }}>
              <TranslatedText i18nKey="controlCenter.auth.addUser.success" />
            </Body>
          )}
          {error && <Body style={{ color: 'red' }}>{error}</Body>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              data-id="add-user-display-name"
              name="displayName"
              type="text"
              placeholder="Display Name"
              value={form.displayName}
              onChange={handleChange}
            />
            <input
              data-id="add-user-email"
              name="email"
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
            />
            <input
              data-id="add-user-password"
              name="password"
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
            />
            <button data-id="add-user-submit" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </FlexColumn>
      </Card>
    </Page>
  );
}

export default AddUser;
