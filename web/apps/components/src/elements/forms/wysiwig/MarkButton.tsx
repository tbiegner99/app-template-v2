import React from 'react';
import { Editor } from '@tiptap/react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';

export type MarkType = 'bold' | 'italic' | 'underline' | 'strike' | 'superscript' | 'subscript';

interface Props {
  editor: Editor | null;
  type: MarkType;
}

const config: Record<MarkType, { icon: React.ReactNode; label: string; command: string }> = {
  bold:        { icon: <FormatBoldIcon fontSize="small" />,        label: 'Bold',        command: 'toggleBold' },
  italic:      { icon: <FormatItalicIcon fontSize="small" />,      label: 'Italic',      command: 'toggleItalic' },
  underline:   { icon: <FormatUnderlinedIcon fontSize="small" />,  label: 'Underline',   command: 'toggleUnderline' },
  strike:      { icon: <StrikethroughSIcon fontSize="small" />,    label: 'Strikethrough', command: 'toggleStrike' },
  superscript: { icon: <SuperscriptIcon fontSize="small" />,       label: 'Superscript', command: 'toggleSuperscript' },
  subscript:   { icon: <SubscriptIcon fontSize="small" />,         label: 'Subscript',   command: 'toggleSubscript' },
};

const MarkButton: React.FC<Props> = ({ editor, type }) => {
  const { icon, label, command } = config[type];
  const isActive = editor?.isActive(type) ?? false;

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          size="small"
          color={isActive ? 'primary' : 'default'}
          disabled={!editor}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onClick={() => editor?.chain().focus()[command]().run()}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default MarkButton;
