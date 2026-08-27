import { ReactNode } from 'react';
import { useI18n } from '../../context';

export const TranslatedText: React.FC<{
  i18nKey: string;
  params?: Record<string, ReactNode>;
}> = ({ i18nKey, params = {} }) => {
  const { dictionary } = useI18n();
  return dictionary.interpolate(i18nKey, params);
};
