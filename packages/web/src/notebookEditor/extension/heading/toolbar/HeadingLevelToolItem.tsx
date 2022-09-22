import { Editor } from '@tiptap/core';
import { Center, forwardRef, Menu, MenuButton, MenuItem, MenuList, Tooltip } from '@chakra-ui/react';
import { BiHeading } from 'react-icons/bi';

import { AttributeType, HeadingLevel, isHeadingLevel, isNumber, NodeName, SelectionDepth } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { ACTIVE_BUTTON_COLOR, ICON_BUTTON_CLASS } from 'notebookEditor/theme/theme';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

import { setHeadingCommand } from '../command';

// ********************************************************************************
// == Constant ====================================================================
const headingLevelOptions = Object.values(HeadingLevel).filter((headingLevel) =>
  isNumber(headingLevel.toString())).map((headingLevel) => ({ value: headingLevel, label: headingLevel }));

const applyHeading = (editor: Editor, depth: SelectionDepth, newLevel: number) => {
  if(!isHeadingLevel(newLevel)) return/*nothing to do*/;

  toolItemCommandWrapper(editor, depth, setHeadingCommand({ [AttributeType.Level]: newLevel }));
  editor.view.focus();
};

// == Component ===================================================================
export const HeadingLevelToolItem: React.FC<EditorToolComponentProps> = ({ editor, depth }) => {
  const isButtonActive = editor.isActive(NodeName.HEADING);
  const shouldBeDisabled = depth !== 1/*only show on the direct parent node of a TextNode*/;

  // == Handler ===================================================================
  const handleChange = (level: string | HeadingLevel) => applyHeading(editor, depth, Number(level));
  const handleKeydown = (event: React.KeyboardEvent<HTMLDivElement>, isOpen: boolean, onClose: () => void) => {
    if(!isOpen) return/*nothing to do*/;
    if(!(event.metaKey && event.altKey)) return/*does not match Heading shortcuts*/;
    if(!event.code.includes('Digit')) return/*User did not press a number*/;

    applyHeading(editor, depth, Number(event.code.split('Digit')[1/*get the number*/]));
    onClose();
  };

  // == UI ========================================================================
  return (
    <Menu>
      {({ isOpen, onClose }) => (
        <>
          <MenuButton
            as={HeadingMenuButton}
            className={ICON_BUTTON_CLASS/*NOTE: must be at this level so that Chakra does not overwrite it*/}
            isButtonActive={isButtonActive}
            shouldBeDisabled={shouldBeDisabled}
          />
          <MenuList
            onKeyDown={(event) => handleKeydown(event, isOpen, onClose)}
          >
            {headingLevelOptions.map((option, optionIndex) =>
              <MenuItem
                key={optionIndex}
                command={`(⌘ + ⌥ + ${option.value})`}
                onClick={() => handleChange(option.value)}
              >
                {`Heading ${option.value}`}
              </MenuItem>
            )}
          </MenuList>
        </>
      )}
    </Menu>
  );
};

// ================================================================================
// REF: https://chakra-ui.com/community/recipes/as-prop#option-1-using-forwardref-from-chakra-uireact
// NOTE: separated so that Chakra ref forwarding works
const HeadingMenuButton = forwardRef((props, ref) => {
  const { isButtonActive, shouldBeDisabled, ...otherProps } = props;

  // -- UI ------------------------------------------------------------------------
  return (
    <Tooltip label='Heading (⌘ + ⌥ + #)'>
      <button
        id={'headingLevelToolItemButton'}
        ref={ref}
        datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
        disabled={shouldBeDisabled}
        style={{ background: isButtonActive ? ACTIVE_BUTTON_COLOR : undefined/*default*/, color: shouldBeDisabled ? 'slategray' : 'black' }}
        {...otherProps}
      >
        <Center>
          <BiHeading />
        </Center>
      </button>
    </Tooltip>
  );
});
