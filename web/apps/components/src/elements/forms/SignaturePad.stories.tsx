import type { Meta, StoryObj } from '@storybook/react';
import { SignaturePad } from './SignaturePad';

const meta: Meta<typeof SignaturePad> = {
  title: 'Elements/Forms/SignaturePad',
  component: SignaturePad,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof SignaturePad>;

export const Default: Story = {
  args: {
    label: 'Signature',
    onAccept: (dataUrl) => console.log('Accepted:', dataUrl ? 'has signature' : 'empty'),
  },
};

export const CustomColors: Story = {
  args: {
    label: 'Sign here',
    penColor: '#2b6cb0',
    backgroundColor: '#ebf8ff',
    width: 500,
    height: 200,
    onAccept: (dataUrl) => console.log('Accepted:', dataUrl ? 'has signature' : 'empty'),
  },
};
