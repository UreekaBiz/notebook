import { Box, Flex } from '@chakra-ui/react';

import { isCodeBlockReferenceNode, isNodeSelection, AttributeType, NodeName, InvalidMergedAttributeValue } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';
import { useLocalValue } from 'notebookEditor/shared/hook/useLocalValue';
import { separateUnitFromString } from 'notebookEditor/theme/type';

import { DelimiterToolItem } from './DelimiterToolItem';
import { getTextDOMRenderedValue } from 'notebookEditor/extension/util/attribute';

// ********************************************************************************
// == Interface ===================================================================
interface Props extends EditorToolComponentProps {/*no additional*/ }

export interface CodeBlockReferenceDelimiterToolItemProps {
  localValue: string;
  inputPlaceholder: string;
  commitChange:  (value?: string | undefined, focus?: boolean | undefined) => void;
  resetLocalValue: () => void;
  updateLocalValue: (newValue: string) => void;
}

// == Component ===================================================================
export const CodeBlockReferenceDelimiterToolItem: React.FC<Props> = ({ editor, depth }) => {
  const { selection } = editor.state;
  if(!isNodeSelection(selection) || !isCodeBlockReferenceNode(selection.node)) throw new Error('Invalid CodeBlockReferenceLeftDelimiterToolItem  Render');

  const leftDelimiter = getTextDOMRenderedValue(editor, AttributeType.LeftDelimiter) ?? ''/*default*/,
        rightDelimiter = getTextDOMRenderedValue(editor, AttributeType.RightDelimiter) ?? ''/*default*/;
  const leftDelimiterValue = String(leftDelimiter === InvalidMergedAttributeValue ? '' : leftDelimiter),
        rightDelimiterValue = String(rightDelimiter === InvalidMergedAttributeValue ? '' : rightDelimiter);

  // == Handler ===================================================================
  // NOTE: Handler above State to prevent 'before declaration' error
  const handleDelimiterChange = (delimiter: 'left' | 'right', value: string, focusEditor?: boolean) => {
    const newDelimiterAttributeObj = delimiter === 'left'
      ? ({ [AttributeType.LeftDelimiter]: value })
      : ({ [AttributeType.RightDelimiter]: value });

    editor.chain()
      .updateAttributes(NodeName.CODEBLOCK_REFERENCE, newDelimiterAttributeObj)
      .setNodeSelection(selection.anchor)
      .run();

    // focus the editor again
    if(focusEditor) editor.commands.focus();
  };

  // == State =====================================================================
  const { commitChange: commitLeftDelimiterChange, localValue: localLeftDelimiterValue, resetLocalValue: resetLocalLeftDelimiterValue, updateLocalValue: updateLocalLeftDelimiterValue } =
    useLocalValue<string>(leftDelimiterValue, (newValue, focus) => handleDelimiterChange('left', newValue, focus));
  let [separatedLeftValue] = separateUnitFromString(localLeftDelimiterValue);

  const { commitChange: commitRightDelimiterChange, localValue: localRightDelimiterValue, resetLocalValue: resetLocalRightDelimiterValue, updateLocalValue: updateLocalRightDelimiterValue } =
    useLocalValue<string>(rightDelimiterValue, (newValue, focus) => handleDelimiterChange('right', newValue, focus));
  let [separatedRightValue] = separateUnitFromString(localRightDelimiterValue);

  // == UI ========================================================================
  return (
    <Box>
      Delimiters
      <Flex marginTop='5px' gap='20px'>
        <DelimiterToolItem
          localValue={separatedLeftValue}
          inputPlaceholder='Left Delimiter'
          commitChange={commitLeftDelimiterChange}
          resetLocalValue={resetLocalLeftDelimiterValue}
          updateLocalValue={updateLocalLeftDelimiterValue}
        />
        <DelimiterToolItem
          localValue={separatedRightValue}
          inputPlaceholder='Right Delimiter'
          commitChange={commitRightDelimiterChange}
          resetLocalValue={resetLocalRightDelimiterValue}
          updateLocalValue={updateLocalRightDelimiterValue}
        />
      </Flex>
    </Box>
  );
};
