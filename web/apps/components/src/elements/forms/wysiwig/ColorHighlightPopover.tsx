import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import BorderColorIcon from '@mui/icons-material/BorderColor';

const swatchColors = [
  '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff9900', '#ff0000',
  '#fce5cd', '#d9ead3', '#cfe2f3', '#ead1dc', '#fff2cc', '#d0e0e3',
  'transparent',
];

interface Props {
  editor: Editor | null;
  onColorChanged: (c: { value: string }) => void;
}

const ColorHighlightPopover: React.FC<Props> = ({ editor, onColorChanged }) => {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  const activeColor = editor?.getAttributes('highlight')?.color ?? 'transparent';
  const isActive = editor?.isActive('highlight');

  return (
    <>
      <Tooltip title="Highlight color">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BorderColorIcon fontSize="small" color={isActive ? 'primary' : 'inherit'} />
            <Box sx={{ width: 16, height: 3, background: activeColor === 'transparent' ? 'rgba(0,0,0,0.2)' : activeColor, borderRadius: 0.5, mt: '1px' }} />
          </Box>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, width: 180 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {swatchColors.map((color) => (
              <Box
                key={color}
                onClick={() => {
                  if (color === 'transparent') {
                    editor?.chain().focus().unsetHighlight().run();
                  } else {
                    editor?.chain().focus().setHighlight({ color }).run();
                  }
                  onColorChanged({ value: color });
                  setAnchor(null);
                }}
                sx={{
                  width: 20, height: 20, borderRadius: 0.5,
                  background: color === 'transparent' ? 'linear-gradient(to bottom right, #fff 45%, #f00 45%, #f00 55%, #fff 55%)' : color,
                  cursor: 'pointer',
                  border: color === activeColor ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.2)',
                  '&:hover': { transform: 'scale(1.2)' },
                }}
              />
            ))}
          </Box>
          <input
            type="color"
            value={activeColor === 'transparent' ? '#ffffff' : activeColor}
            onChange={(e) => {
              editor?.chain().focus().setHighlight({ color: e.target.value }).run();
              onColorChanged({ value: e.target.value });
            }}
            style={{ width: '100%', height: 32, cursor: 'pointer', border: 'none', padding: 0 }}
          />
        </Box>
      </Popover>
    </>
  );
};

export default ColorHighlightPopover;
