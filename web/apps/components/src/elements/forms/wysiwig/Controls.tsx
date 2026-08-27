import {
  MenuButtonAddTable,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonCodeBlock,
  MenuButtonEditLink,
  MenuButtonHighlightColor,
  MenuButtonItalic,
  MenuButtonStrikethrough,
  MenuButtonTextColor,
  MenuButtonUnderline,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectFontFamily,
  MenuSelectFontSize,
  MenuSelectHeading,
  MenuButtonHorizontalRule,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuSelectTextAlign,
  MenuButtonTaskList,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonSuperscript,
  MenuButtonSubscript,
  MenuButton,
  MenuButtonImageUpload,
  type ImageNodeAttributes,
} from 'mui-tiptap';

import { Editor } from '@tiptap/react';
import { VariableDefinition } from './extensions/variables/variableConfig';
import { VAR_START_SEQUENCE } from './extensions/variables/Variable';
const fontFamilyOptions = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Helvetica', value: 'Helvetica' },
];

const swatchColors = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FFA500',
  '#800080',
  '#00FFFF',
  '#FFC0CB',
  '#A52A2A',
  '#808080',
  '#FFFFFF',
];

export const Controls: React.FC<{ variables?: VariableDefinition[]; editor: Editor }> = ({
  variables = [],
  editor,
}) => {
  return (
    <MenuControlsContainer>
      <MenuSelectHeading />
      <MenuSelectFontFamily options={fontFamilyOptions} />
      <MenuSelectFontSize />
      <MenuButtonTextColor swatchColors={swatchColors} />
      <MenuButtonHighlightColor swatchColors={swatchColors} />
      <MenuDivider />
      <MenuButtonBold />
      <MenuButtonItalic />
      <MenuButtonUnderline />
      <MenuDivider />
      <MenuButtonStrikethrough />
      <MenuButtonSuperscript />
      <MenuButtonSubscript />
      <MenuButtonCodeBlock />
      <MenuButtonBlockquote />
      <MenuDivider />
      <MenuSelectTextAlign disabled={false} />
      <MenuButtonBulletedList />
      <MenuButtonOrderedList />
      <MenuButtonTaskList />

      <MenuDivider />
      <MenuButtonAddTable />
      <MenuButtonEditLink />
      <MenuButtonHorizontalRule />
      <MenuButtonImageUpload
        onUploadFiles={async (files) => {
          const imagePromises = files.map((file) => {
            return new Promise<ImageNodeAttributes>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  src: reader.result as string,
                  alt: file.name,
                });
              };
              reader.readAsDataURL(file);
            });
          });
          return Promise.all(imagePromises);
        }}
      />
      {variables.length > 0 && (
        <MenuButton
          tooltipLabel="Insert Variable"
          tooltipShortcutKeys={['Shift', 'Space']}
          onClick={() => editor.chain().focus().insertContent(VAR_START_SEQUENCE).run()}
        >
          {'VAR'}
        </MenuButton>
      )}
      <MenuDivider />
      <MenuButtonUndo />
      <MenuButtonRedo />
      {/* Add more controls of your choosing here */}
    </MenuControlsContainer>
  );
};
