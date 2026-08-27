//taken from https://codesandbox.io/p/sandbox/mui-tiptap-demo-3zl2l6?file=%2Fsrc%2FSuggestionList.tsx%3A6%2C1-15%2C3
import { mergeAttributes } from '@tiptap/core';
import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { PluginKey } from 'prosemirror-state';
import { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export const VAR_START_SEQUENCE = '${';

export type VariableListRef = {
  // For convenience using this SuggestionList from within the
  // mentionSuggestionOptions, we'll match the signature of SuggestionOptions's
  // `onKeyDown` returned in its `render` function
  onKeyDown: NonNullable<
    ReturnType<NonNullable<SuggestionOptions<Variable>['render']>>['onKeyDown']
  >;
};

export interface Variable {
  id: string;
  name: string;
}

export interface VariableMentionOptions {
  variables: Variable[];
  char?: string;
  HTMLAttributes?: Record<string, unknown>;
  suggestion?: Partial<SuggestionOptions>;
}

export const Variable = Mention.extend<VariableMentionOptions>({
  name: 'variable',
  addKeyboardShortcuts() {
    return {
      'Shift-Space': () => this.editor.chain().focus().insertContent(VAR_START_SEQUENCE).run(),
    };
  },
  addOptions() {
    return {
      ...this.parent?.(),
      char: VAR_START_SEQUENCE,
      variables: [],
      HTMLAttributes: {},

      suggestion: {
        char: VAR_START_SEQUENCE,
        pluginKey: new PluginKey(this.name),
        command: ({ editor, range, props }) => {
          range.to += 1;

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: this.name,
                attrs: {
                  id: props.id,
                  name: props.name + '}',
                },
              },
            ])
            .run();

          window.getSelection()?.collapseToEnd();
        },
        allow: ({ editor: _editor, state: _state, range: _range }) => {
          return true;
        },
        items: ({ query }) => {
          return (this as any).options.variables
            .filter((item: Variable) => item.name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
        },
        render: () => {
          let component: ReactRenderer;
          let popup: TippyInstance[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(VariableList, {
                props,
                editor: props.editor,
              });

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate: (props) => {
              component?.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup?.[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.[0].hide();

                return true;
              }

              return (component?.ref as any)?.onKeyDown(props);
            },

            onExit: () => {
              popup?.[0].destroy();
              component?.destroy();
            },
          };
        },
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },

      name: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.name) {
            return {};
          }

          return {
            'data-name': attributes.name,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'var',
      mergeAttributes({ 'data-type': this.name }, this.options.HTMLAttributes, HTMLAttributes),
      this.options.suggestion?.char || '',
      node.attrs.name || node.attrs.id,
    ];
  },

  renderText({ node }) {
    return `${this.options.suggestion?.char}${node.attrs.name || node.attrs.id}}`;
  },
});

interface VariableListProps {
  items: Variable[];
  command: (item: Variable) => void;
}

export const VariableList = forwardRef<VariableListRef, VariableListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '0.25rem',
        zIndex: 9999,
        position: 'relative',
      }}
    >
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              backgroundColor: index === selectedIndex ? '#dbeafe' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            {item.name}
          </button>
        ))
      ) : (
        <div style={{ padding: '0.25rem 0.5rem', color: '#6b7280' }}>No variables found</div>
      )}
    </div>
  );
});
VariableList.displayName = 'VariableList';
