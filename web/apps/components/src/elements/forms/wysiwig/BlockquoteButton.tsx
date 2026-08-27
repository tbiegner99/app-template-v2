import React from 'react';
import { Editor } from '@tiptap/react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

interface Props {
  editor: Editor | null;
}

const BlockquoteButton: React.FC<Props> = ({ editor }) => (
  <Tooltip title="Blockquote">
    <span>
      <IconButton
        size="small"
        color={editor?.isActive('blockquote') ? 'primary' : 'default'}
        disabled={!editor}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
      >
        <FormatQuoteIcon fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export default BlockquoteButton;
