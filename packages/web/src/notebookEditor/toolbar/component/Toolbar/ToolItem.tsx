import { Center, Tooltip } from '@chakra-ui/react';
import { Editor } from '@tiptap/core';
import { useCallback, MouseEventHandler } from 'react';

import { NodeName } from '@ureeka-notebook/web-service';

import { isHeadingToolActive } from 'notebookEditor/extension/heading/toolbar';
import { useEditorService } from 'notebookEditor/hook/useEditorService';
import { SelectionDepth } from 'notebookEditor/model/type';
import { ACTIVE_BUTTON_COLOR } from 'notebookEditor/theme/theme';
import { EditorTool } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props {
  editor: Editor;
  tool: EditorTool;

  depth: SelectionDepth;
}
export const ToolItem: React.FC<Props> = ({ editor, tool, depth })=> {
  const { notebookId, editorService } = useEditorService();
  const isButtonActive = isToolActive(editor, tool);

  // == Handlers ==================================================================
  const handleToolClick = useCallback<MouseEventHandler>((event) => {
    event.preventDefault();
    event.stopPropagation();

    if(tool.toolType !== 'button') return/*nothing to do*/;

    tool.onClick(editor, depth);
  }, [editor, depth, tool]);

  // == UI ========================================================================
  if(tool.shouldShow && !tool.shouldShow(editor, depth)) return null;
  if(tool.toolType === 'component') return <>{tool.component({ editor, depth, notebookId, editorService })/*may be heavy-weight hence memo'd*/}</>;

  return (
    <Tooltip hasArrow label={tool.tooltip} openDelay={100/*T&E: do not show immediately*/} size='md' >
      <button id={tool.name} key={tool.name} className='iconButton' disabled={tool.shouldBeDisabled && tool.shouldBeDisabled(editor)} style={{ background: isButtonActive ? ACTIVE_BUTTON_COLOR : undefined/*default*/, color: tool.shouldBeDisabled && tool.shouldBeDisabled(editor) ? 'slategray' : 'black' }} onClick={handleToolClick}>
        <Center>
          {tool.icon}
        </Center>
      </button>
    </Tooltip>
  );
};

// == Util ========================================================================
const isToolActive = (editor: Editor, tool: EditorTool) => {
  if(tool.name.includes(NodeName.HEADING)) return isHeadingToolActive(editor, tool.name);

  return tool.toolType === 'button' && editor.isActive(tool.name);
};
