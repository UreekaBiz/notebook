import { getMarkAttributes } from '@tiptap/core';

import { extendMarkRangeCommand, isLinkMarkAttributes, setTextSelectionCommand, AttributeType, LinkTarget, MarkName } from '@ureeka-notebook/web-service';

import { DropdownTool, DropdownToolItemType } from 'notebookEditor/extension/shared/component/DropdownToolItem/DropdownTool';
import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

import { setLinkCommand } from '../../command';
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
    const { schema } = editor.state;
    const { dispatch } = editor.view;
    const { anchor: prevPos } = editor.state.selection;

    extendMarkRangeCommand(schema, MarkName.LINK, {/*no attributes*/})(editor.state/*current state*/, dispatch);
    setLinkCommand({ ...attrs, target: target as LinkTarget/*as defined above*/ })(editor.state/*current state*/, dispatch);
    setTextSelectionCommand({ from: prevPos, to: prevPos })(editor.state/*current state*/, dispatch);

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
