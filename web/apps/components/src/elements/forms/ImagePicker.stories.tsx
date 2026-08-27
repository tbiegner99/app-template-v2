import type { Meta, StoryObj } from '@storybook/react';
import { FilePicker } from './ImagePicker';

const meta: Meta<typeof FilePicker> = {
  title: 'Elements/Forms/FilePicker',
  component: FilePicker,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FilePicker>;

export const Image: Story = {
  args: {
    label: 'Upload Photo',
    accept: ['image'],
    onFilePicked: (file) => console.log('picked:', file.name),
  },
};

export const PDF: Story = {
  args: {
    label: 'Upload PDF',
    accept: ['pdf'],
    onFilePicked: (file) => console.log('picked:', file.name),
  },
};

export const ImageOrPDF: Story = {
  args: {
    label: 'Upload Image or PDF',
    accept: ['image', 'pdf'],
    onFilePicked: (file) => console.log('picked:', file.name),
  },
};

export const Document: Story = {
  args: {
    label: 'Upload Document',
    accept: ['document'],
    placeholder: 'Click or drag a PDF, Word, or text file here',
    onFilePicked: (file) => console.log('picked:', file.name),
  },
};

export const AnyFile: Story = {
  args: {
    label: 'Upload Any File',
    accept: ['any'],
    onFilePicked: (file) => console.log('picked:', file.name),
  },
};
