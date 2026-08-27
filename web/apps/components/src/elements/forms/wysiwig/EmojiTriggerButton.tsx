import React from 'react';
import { Editor } from '@tiptap/react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';

interface Props {
  editor: Editor | null;
}

const EmojiTriggerButton: React.FC<Props> = ({ editor }) => (
  <Tooltip title="Insert emoji">
    <span>
      <IconButton
        size="small"
        disabled={!editor}
        onClick={() => editor?.chain().focus().insertContent('😊').run()}
      >
        <InsertEmoticonIcon fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export default EmojiTriggerButton;
