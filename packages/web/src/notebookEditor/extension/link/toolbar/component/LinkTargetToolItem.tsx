import { getMarkAttributes } from '@tiptap/core';

import { isLinkMarkAttributes, AttributeType, ExtendMarkRangeDocumentUpdate, LinkTarget, MarkName, SetTextSelectionDocumentUpdate } from '@ureeka-notebook/web-service';

import { applyDocumentUpdates } from 'notebookEditor/command/update';
import { DropdownTool, DropdownToolItemType } from 'notebookEditor/extension/shared/component/DropdownToolItem/DropdownTool';
import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

import { SetLinkDocumentUpdate } from '../../command';
import { getReadableLinkTarget } from '../../util';

// ********************************************************************************
const targetOptions: DropdownToolItemType[] = Object.entries(LinkTarget).map(([key, value]) => ({ label: getReadableLinkTarget(value), value: value }));

interface Props extends EditorToolComponentProps {/*no additional*/}
// NOTE: Using custom ToolItem Component instead of using the DropdownToolItem
//       since the Link must be updated with custom meta tags and cannot work with
//       default behavior.
export const LinkTargetToolItem: React.FC<Props> = ({ editor }) => {
  const attrs = getMarkAttributes(editor.state, MarkName.LINK);
  if(!isLinkMarkAttributes(attrs)) return null/*nothing to render*/;
  const value = attrs[AttributeType.Target] ?? ''/*default none*/;

  // == Handler ===================================================================
  const handleChange = (target: string) => {
    const { anchor: prevPos } = editor.state.selection;

    applyDocumentUpdates(editor, [
      new ExtendMarkRangeDocumentUpdate(MarkName.LINK, {/*no attributes*/}),
      new SetLinkDocumentUpdate({ ...attrs, [AttributeType.Target]: target as LinkTarget/*as defined above*/ }),
      new SetTextSelectionDocumentUpdate({ from: prevPos, to: prevPos }),
    ]);

    // focus the editor again
    editor.view.focus();
  };

  // == UI ========================================================================
  return (
    <InputToolItemContainer name='Target'>
      <DropdownTool value={value} options={targetOptions} placeholder='Target' onChange={handleChange}/>
    </InputToolItemContainer>
  );
};
