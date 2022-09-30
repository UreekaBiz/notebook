import { Menu, MenuButton, MenuItem, MenuList, Text, ComponentWithAs, As } from '@chakra-ui/react';
import { Node as ProseMirrorNode } from 'prosemirror-model';

import { getParentNode, NodeName } from '@ureeka-notebook/web-service';

import { ICON_BUTTON_CLASS } from 'notebookEditor/theme/theme';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

// ********************************************************************************
// == Interface ===================================================================
interface DropdownButtonToolItemProps extends EditorToolComponentProps {
  nodeName: NodeName;

  /** the name of the ToolItem */
  name: string;

  // REF: https://chakra-ui.com/community/recipes/as-prop#option-1-using-forwardref-from-chakra-uireact
  // NOTE: separated so that Chakra ref forwarding works (SEE: REF above)
  /** the forwarded Component that serves as the MenuButton trigger to display the ToolItem options */
  asMenuButton: ComponentWithAs<As<any>, object>;

  /** the available options to choose from */
  options: { value: string | number | boolean; commandLabel: string; displayLabel: string;  }[];

  /** the function that evaluates whether the current ToolItem option is selected  */
  selectedOptionCheck: (parent: ProseMirrorNode, optionValue: string | number | boolean, optionIndex: number) => boolean;

  /** the function that handles click events inside the ToolItem  */
  handleClick: (value: string | number | boolean) => void;

  /** the function that handles keydown events when the ToolItem is open */
  handleKeydown: (event: React.KeyboardEvent<HTMLDivElement>, isOpen: boolean, onClose: () => void) => void;
}

// == Component ===================================================================
export const DropdownButtonToolItem: React.FC<DropdownButtonToolItemProps> = ({ editor, depth, nodeName, asMenuButton, options, selectedOptionCheck, handleClick, handleKeydown }) => {
  const parent = getParentNode(editor.state.selection);
  const isButtonActive = parent.type.name === nodeName;
  const shouldBeDisabled = depth !== 1/*only show on the direct parent*/;

  // == UI ========================================================================
  return (
    <Menu>
      {({ isOpen, onClose }) => (
        <>
          <MenuButton
            as={asMenuButton}
            className={ICON_BUTTON_CLASS/*NOTE: must be at this level so that Chakra does not overwrite it*/}
            isButtonActive={isButtonActive}
            shouldBeDisabled={shouldBeDisabled}
          />
          <MenuList onKeyDown={(event) => handleKeydown(event, isOpen, onClose)}>
            {options.map((option, optionIndex) =>
              <MenuItem
                key={optionIndex}
                command={option.commandLabel}
                onClick={() => handleClick(option.value)}
              >
                <Text
                  decoration={selectedOptionCheck(parent, option.value, optionIndex) ? 'underline' : ''/*none*/}
                  textTransform='capitalize'
                >
                  {option.displayLabel}
                </Text>
              </MenuItem>
            )}
          </MenuList>
        </>
      )}
    </Menu>
  );
};
