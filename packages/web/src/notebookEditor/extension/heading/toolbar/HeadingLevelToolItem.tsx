import { Editor } from '@tiptap/core';
import { forwardRef, Center, Tooltip } from '@chakra-ui/react';
import { BiHeading } from 'react-icons/bi';

import { isHeadingLevel, isHeadingNode, isNumber, AttributeType, HeadingLevel, SelectionDepth, NodeName } from '@ureeka-notebook/web-service';

import { toolItemCommandWrapper } from 'notebookEditor/command/util';
import { DropdownButtonToolItem } from 'notebookEditor/extension/shared/component/DropdownButtonToolItem';
import { EditorToolComponentProps, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/sidebar/toolbar/type';
import { ACTIVE_BUTTON_COLOR } from 'notebookEditor/theme/theme';

import { setHeadingCommand } from '../command';

// ********************************************************************************
// == Constant ====================================================================
const headingLevelOptions = Object.values(HeadingLevel).filter((headingLevel) =>
  isNumber(headingLevel.toString())).map((headingLevel) => ({
    value: Number(headingLevel),
    commandLabel: `(⌘ + ⌥ + ${headingLevel})`,
    displayLabel: `Heading ${headingLevel.toString()}`,
  }));

const applyHeading = (editor: Editor, depth: SelectionDepth, newLevel: number) => {
  if(!isHeadingLevel(newLevel)) return/*nothing to do*/;

  toolItemCommandWrapper(editor, depth, setHeadingCommand({ [AttributeType.Level]: newLevel }));
  editor.view.focus();
};

// == Component ===================================================================
export const HeadingLevelToolItem: React.FC<EditorToolComponentProps> = ({ editor, depth }) => {
  // == Handler ===================================================================
  const handleClick = (value: string | number | boolean) => {
    if(!isNumber(value.toString())) return/*not a number*/;

    applyHeading(editor, depth, Number(value));
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLDivElement>, isOpen: boolean, onClose: () => void) => {
    if(!isOpen) return/*nothing to do*/;
    if(!(event.metaKey && event.altKey)) return/*does not match Heading shortcuts*/;
    if(!event.code.includes('Digit')) return/*User did not press a number*/;

    applyHeading(editor, depth, Number(event.code.split('Digit')[1/*get the number*/]));
    onClose();
  };

  // == UI ========================================================================
  return (
    <DropdownButtonToolItem
      editor={editor}
      depth={depth}
      nodeName={NodeName.HEADING}
      name='headingLevelToolItem'
      asMenuButton={HeadingMenuButton}
      options={headingLevelOptions}
      selectedOptionCheck={(parent, optionIndex) => isHeadingNode(parent) && parent.attrs[AttributeType.Level] === (optionIndex+1/*account for 0 indexing*/)}
      handleClick={handleClick}
      handleKeydown={handleKeydown}
    />
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
        id='headingLevelToolItemButton'
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
