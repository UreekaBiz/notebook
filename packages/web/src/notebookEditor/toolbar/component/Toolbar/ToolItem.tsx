import { useToast, Center, Tooltip } from '@chakra-ui/react';
import { Editor } from '@tiptap/core';
import { useCallback } from 'react';

import { NodeName } from '@ureeka-notebook/web-service';

import ErrorBoundary from 'core/component/ErrorBoundary';
import { isHeadingToolActive } from 'notebookEditor/extension/heading/toolbar';
import { SelectionDepth } from 'notebookEditor/model/type';
import { ACTIVE_BUTTON_COLOR, ICON_BUTTON_CLASS } from 'notebookEditor/theme/theme';
import { ToolItem, TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props {
  editor: Editor;
  tool: ToolItem;

  depth: SelectionDepth;
}
// NOTE: this component is not meant to be used directly, it is meant to be used
//       inside a ErrorBoundary component. (See below)
const InternalToolItem: React.FC<Props> = ({ editor, tool, depth }) => {
  const isButtonActive = isToolActive(editor, tool);
  const toast = useToast();

  // == Handlers ==================================================================
  const handleToolClick = useCallback(() => {
    if(tool.toolType !== 'button') return/*nothing to do*/;

    // prevent application from breaking in case of an error in the ToolItem.
    try {
      tool.onClick(editor, depth);
    } catch(error) {
      // TODO: ToolItems should throw an specific type of Error to be handled here.
      //       Get the message from the error or use a default message as a fallback.
      const message =  error instanceof Error ? error.message : `Unknown error.`;

      // TODO: Log error to the server.

      toast({
        title: `Error while executing the tool ${tool.label}`,
        description: message,
        status: 'error',
        duration: 3000/*3 seconds*//*FIXME: make this a constant (classes of these for different cases?)*/,
        isClosable: true,
      });
    }
  }, [editor, depth, toast, tool]);

  // == UI ========================================================================
  if(tool.shouldShow && !tool.shouldShow(editor, depth)) return null/*nothing to render*/;
  if(tool.toolType === 'component') return <>{tool.component({ editor, depth })/*use tool component implementation*/}</>;

  return (
    <Tooltip hasArrow label={tool.tooltip} size='md'>
      <button
        id={tool.name}
        datatype={TOOL_ITEM_DATA_TYPE/*(SEE: notebookEditor/toolbar/type )*/}
        key={tool.name}
        className={ICON_BUTTON_CLASS}
        disabled={tool.shouldBeDisabled && tool.shouldBeDisabled(editor)}
        style={{ background: isButtonActive ? ACTIVE_BUTTON_COLOR : undefined/*default*/, color: tool.shouldBeDisabled && tool.shouldBeDisabled(editor) ? 'slategray' : 'black' }}
        onClick={handleToolClick}
      >
        <Center>
          {tool.icon}
        </Center>
      </button>
    </Tooltip>
  );
};

// wraps the InternalToolItem component in a ErrorBoundary component to prevent
// errors on the Item to bubble out and break the application
// NOTE: suffix "Component" is used to avoid conflict with ToolItem type
export const ToolItemComponent: React.FC<Props> = (props) => {
  // component to display when an error occurs on the InternalToolItem. Currently,
  // nothing is rendered when there is an error by contract since it is required
  // that the User's experience is never interrupted
  const ErrorComponent = null/*don't render anything*/;
  return <ErrorBoundary errorComponent={ErrorComponent}><InternalToolItem {...props} /></ErrorBoundary>;
};

// == Util ========================================================================
const isToolActive = (editor: Editor, tool: ToolItem) => {
  // NOTE: This is a special case since Heading node uses multiple Tool Items for
  //       the same kind of node only differentiated by the Level attribute.
  if(tool.name.includes(NodeName.HEADING)) return isHeadingToolActive(editor, tool.name);

  return tool.toolType === 'button' && editor.isActive(tool.name);
};
