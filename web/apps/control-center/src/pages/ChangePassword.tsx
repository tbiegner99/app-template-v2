import React, { useState } from 'react';
import {
  Body, Card, FlexColumn, TranslatedText,
  TextInput, PrimaryButton, useI18n,
} from '@__SLUG__/components';
import { Page } from '../components/layout/Page';
import { changePassword } from '../domains/auth/datasource';
import { WrongPasswordError } from '../domains/auth/models';
import { setTraceId, ApiError } from '../lib/httpClient';

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function ChangePassword() {
  const { dictionary } = useI18n();
  const [form, setForm] = useState<ChangePasswordForm>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.newPassword !== form.confirmPassword) {
      setError(dictionary.translate('controlCenter.common.passwordMismatch'));
      return;
    }
    setLoading(true);
    setTraceId(crypto.randomUUID());
    try {
      await changePassword(form.oldPassword, form.newPassword);
      setSuccess(true);
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      if (err instanceof WrongPasswordError) {
        setError(err.message);
      } else if (err instanceof ApiError) {
        setError(`${dictionary.translate('controlCenter.auth.changePassword.error')} (ID: ${err.traceId})`);
      } else {
        setError(dictionary.translate('controlCenter.auth.changePassword.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title={<TranslatedText i18nKey="controlCenter.auth.changePassword.title" />}>
      <Card>
        <form onSubmit={handleSubmit}>
          <FlexColumn gap={16}>
            {success && (
              <Body style={{ color: 'green' }}>
                <TranslatedText i18nKey="controlCenter.auth.changePassword.success" />
              </Body>
            )}
            {error && <Body style={{ color: 'red' }}>{error}</Body>}
            <TextInput
              data-id="change-password-old"
              label={dictionary.translate('controlCenter.auth.changePassword.currentPassword')}
              type="password"
              value={form.oldPassword}
              onChange={(v) => setForm((f) => ({ ...f, oldPassword: v }))}
            />
            <TextInput
              data-id="change-password-new"
              label={dictionary.translate('controlCenter.common.newPassword')}
              type="password"
              value={form.newPassword}
              onChange={(v) => setForm((f) => ({ ...f, newPassword: v }))}
            />
            <TextInput
              data-id="change-password-confirm"
              label={dictionary.translate('controlCenter.auth.changePassword.confirmNewPassword')}
              type="password"
              value={form.confirmPassword}
              onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
            />
            <PrimaryButton data-id="change-password-submit" type="submit" disabled={loading}>
              {loading
                ? <TranslatedText i18nKey="controlCenter.common.saving" />
                : <TranslatedText i18nKey="controlCenter.auth.changePassword.title" />}
            </PrimaryButton>
          </FlexColumn>
        </form>
      </Card>
    </Page>
  );
}

export default ChangePassword;
