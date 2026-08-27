import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';

const swatchColors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

interface Props {
  editor: Editor | null;
  hideWhenUnavailable?: boolean;
  onColorChanged: (c: { value: string }) => void;
}

const ColorTextPopover: React.FC<Props> = ({ editor, hideWhenUnavailable, onColorChanged }) => {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  if (hideWhenUnavailable && !editor?.can().setColor?.('#000000')) return null;

  const activeColor = editor?.getAttributes('textStyle')?.color ?? '#000000';

  return (
    <>
      <Tooltip title="Text color">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FormatColorTextIcon fontSize="small" />
            <Box sx={{ width: 16, height: 3, background: activeColor, borderRadius: 0.5, mt: '1px' }} />
          </Box>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, width: 200 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {swatchColors.map((color) => (
              <Box
                key={color}
                onClick={() => { onColorChanged({ value: color }); setAnchor(null); }}
                sx={{
                  width: 20, height: 20, borderRadius: 0.5, background: color, cursor: 'pointer',
                  border: color === activeColor ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.2)',
                  '&:hover': { transform: 'scale(1.2)' },
                }}
              />
            ))}
          </Box>
          <input
            type="color"
            value={activeColor}
            onChange={(e) => onColorChanged({ value: e.target.value })}
            style={{ width: '100%', height: 32, cursor: 'pointer', border: 'none', padding: 0 }}
          />
        </Box>
      </Popover>
    </>
  );
};

export default ColorTextPopover;
