import React from 'react';
import { Meta } from '@storybook/react';
import { action as fn } from 'storybook/actions';
import {
  PrimaryButton,
  SecondaryButton,
  SuccessButton,
  DestructiveButton,
  WarningButton,
  InfoButton,
  LinkButton,
} from './Button';

const meta: Meta = {
  title: 'elements/buttons/Button',
  tags: ['autodocs'],
  component: PrimaryButton,
  argTypes: {
    onClick: { action: 'clicked' },
    variant: {
      control: { type: 'radio' },
      options: ['contained', 'outlined', 'text'],
    },
  },
};

export default meta;

export const All = (args) => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <PrimaryButton onClick={fn()} {...args}>
      Primary
    </PrimaryButton>
    <SecondaryButton onClick={fn()} {...args}>
      Secondary
    </SecondaryButton>
    <SuccessButton onClick={fn()} {...args}>
      Success
    </SuccessButton>
    <DestructiveButton onClick={fn()} {...args}>
      Destructive
    </DestructiveButton>
    <WarningButton onClick={fn()} {...args}>
      Warning
    </WarningButton>
    <InfoButton onClick={fn()} {...args}>
      Info
    </InfoButton>
    <LinkButton onClick={fn()}>Link</LinkButton>
  </div>
);

const Template = (args: object) => <PrimaryButton {...args} />;

export const Primary = Template.bind({});
Primary.args = { children: 'Primary', variant: 'contained' };

export const Variants = Template.bind({});
Variants.args = { children: 'Contained', variant: 'contained' };
