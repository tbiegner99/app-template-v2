import React from 'react';
import { Meta } from '@storybook/react';
import { useState } from 'react';
import TopBar from './TopBar';
import LanguageSelector from './LanguageSelector';

const meta: Meta = { title: 'elements/nav/LanguageSelector', tags: ['autodocs'] };

export default meta;

export const InTopBar = () => {
  const [lang, setLang] = useState('en');
  return (
    <TopBar
      title="__DISPLAY_NAME__"
      rightActions={<LanguageSelector value={lang} onChange={(c) => setLang(c)} />}
      avatar={{ name: 'TJ', menuItems: [{ label: 'Logout', onClick: () => undefined }] }}
    />
  );
};

export const Standalone = () => {
  const [lang, setLang] = useState('en');
  return <LanguageSelector value={lang} onChange={(c) => setLang(c)} />;
};
