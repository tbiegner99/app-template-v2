import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// Icons used by MarkButton (imported inside that component)
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
// Color icon is used inside the ColorTextPopover component
import ColorTextPopover from './ColorTextPopover';
import ColorHighlightPopover from './ColorHighlightPopover';
import BlockquoteButton from './BlockquoteButton';
import EmojiTriggerButton from './EmojiTriggerButton';
import MarkButton from './MarkButton';

export interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  editable = true,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight,
      TaskList,
      TaskItem,
      FontFamily,
      Superscript,
      Subscript,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  const applyColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  const setFont = (font: string) => {
    if (!editor) return;
    // use the FontFamily extension's command
    // it exposes `setFontFamily` which accepts a string
    // (TypeScript will pick up types from the installed extension)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    editor.chain().focus().setFontFamily(font).run();
  };

  const setBlockType = (type: string) => {
    if (!editor) return;
    if (type === 'paragraph') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const match = type.match(/^heading-(\d)$/);
    if (match) {
      const level = parseInt(match[1], 10);
      if (!level || level < 1 || level > 6) return;
      const lvl = level as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level: lvl }).run();
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="wysiwyg-block-label">Block</InputLabel>
          <Select
            labelId="wysiwyg-block-label"
            label="Block"
            value={
              editor
                ? editor.isActive('paragraph')
                  ? 'paragraph'
                  : editor.isActive('heading', { level: 1 })
                  ? 'heading-1'
                  : editor.isActive('heading', { level: 2 })
                  ? 'heading-2'
                  : editor.isActive('heading', { level: 3 })
                  ? 'heading-3'
                  : editor.isActive('heading', { level: 4 })
                  ? 'heading-4'
                  : editor.isActive('heading', { level: 5 })
                  ? 'heading-5'
                  : editor.isActive('heading', { level: 6 })
                  ? 'heading-6'
                  : 'paragraph'
                : 'paragraph'
            }
            onChange={(e) => setBlockType(String(e.target.value))}
          >
            <MenuItem value="paragraph">Paragraph</MenuItem>
            {Array.from({ length: 6 }, (_, i) => i + 1).map((level) => (
              <MenuItem key={`heading-${level}`} value={`heading-${level}`}>
                Heading {level}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="wysiwyg-font-label">Font</InputLabel>
          <Select
            labelId="wysiwyg-font-label"
            label="Font"
            value={editor?.getAttributes('textStyle')?.fontFamily || 'Roboto'}
            onChange={(e) => setFont(String(e.target.value))}
          >
            <MenuItem value="Roboto">Roboto</MenuItem>
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Georgia">Georgia</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem value="Courier New">Courier New</MenuItem>
          </Select>
        </FormControl>
        <MarkButton editor={editor} type="bold" />
        <MarkButton editor={editor} type="italic" />
        <MarkButton editor={editor} type="underline" />
        <MarkButton editor={editor} type="strike" />
        <MarkButton editor={editor} type="superscript" />
        <MarkButton editor={editor} type="subscript" />

        <IconButton
          size="small"
          color={editor?.isActive('bulletList') ? 'primary' : 'default'}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon />
        </IconButton>

        <IconButton
          size="small"
          color={editor?.isActive('orderedList') ? 'primary' : 'default'}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon />
        </IconButton>

        <IconButton
          size="small"
          color={editor?.isActive('taskList') ? 'primary' : 'default'}
          onClick={() => {
            // toggleTaskList is provided by the task-list extension
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            editor?.chain().focus().toggleTaskList().run();
          }}
        >
          <TaskAltIcon />
        </IconButton>

        <BlockquoteButton editor={editor} />
        <ColorHighlightPopover editor={editor} onColorChanged={() => {}} />
        <EmojiTriggerButton editor={editor} />

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ColorTextPopover
            editor={editor}
            hideWhenUnavailable={true}
            onColorChanged={(c) => applyColor(c.value)}
          />
        </Box>
      </Box>
      <Box sx={{ minHeight: 120 }}>
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
};

export default TiptapEditor;
