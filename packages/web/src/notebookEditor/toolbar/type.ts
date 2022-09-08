import { Editor } from '@tiptap/core';
import { ReactElement } from 'react';

import { MarkName, NodeName, SelectionDepth } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Toolbar =====================================================================
export type Toolbar = Readonly<{
  /** Title that is being displayed on the Toolbar and in the Breadcrumb.*/
  title: string;
  /** Unique name of the toolbar, its must correspond to the specific Node or mark
   *  that it is associated with */
  name: NodeName | MarkName;

  /** Optional component that will be displayed on the right side of the title. */
  rightContent?: (props: EditorToolComponentProps) => ReactElement | null/*allow to be rendered conditionally*/;

  /** A collection of EditorToolItems that correspond to the toolbar. */
  toolsCollections: ToolItem[][];

  /** Defaults to always show if not provided. This function is also used to
   *  determinate if the corresponding Breadcrumb should be shown. */
  shouldShow?: (editor: Editor, depth: SelectionDepth) => boolean;
}>;

// == Tool ========================================================================
// Data type added to all tool items. Must be added to the element that is
// intended to receive focus when creating toolItems that are components
export const TOOL_ITEM_DATA_TYPE = 'toolItem';

export type ToolType = 'button' | 'component';
export type ToolName = string/*alias*/;
export type ToolItem = Readonly<{
  /** The type of the editor tool */
  toolType: ToolType;

  /** A unique name for the tool. */
  name: ToolName;

  /** Defaults to not be disabled if not provided */
  shouldBeDisabled?: (editor: Editor, depth: SelectionDepth) => boolean;

  /** Defaults to always show if not provided  */
  shouldShow?: (editor: Editor, depth: SelectionDepth) => boolean;

  /** A schema that defines if the ToolItem can be rendered */
  // NOTE: this differs from shouldShow this validation schema are requirements to
  //       determinate if the ToolItem can exists with the given Editor State and
  //       prevent errors, while shouldShow is a utility to hide the ToolItem from
  //       the User improving the UX.
  //       If this validation schema fails that means that there is a bug in the
  //       logic that renders the ToolItem
  validationSchema?: ToolItemValidationSchema;
}> & (EditorToolComponent | EditorToolButton);

// -- Validation ------------------------------------------------------------------
// a collection of validators that can be used to validate if the Tool Item can be
// rendered
// NOTE: The validation schema --must-- be used to prevent errors, it logs when
//       the validation fails. If the ToolItem should be hidden from the user by
//       UX reasons shouldShow should be used instead.
export type ToolItemValidationSchema = {
  /** The current selected node match the given Node. If not provided any Node
   *  selected can use the ToolItem */
  // NOTE: if this value is present it will treat as if nodeSelection is set to
  //       true since the Selection must be a NodeSelection in order to have a
  //       selected Node
  node?: NodeName;
  /** The current selection is an instance of NodeSelection */
  nodeSelection?: boolean;

  /** Validates if the Tool Item can be renderer based on the given props. If the
   *  return value is false, the Tool Item won't be rendered. */
  validator?: ToolItemValidator;
};
export type ToolItemValidator = (editor: Editor, depth: SelectionDepth) => boolean;

// -- Component -------------------------------------------------------------------
// NOTE: must be in sync with the parameters of the component property in EditorToolComponent
export type EditorToolComponentProps = Readonly<{
  /** An instance of the Editor that is being used.*/
  editor: Editor;
  /** the depth of the current Selection */
  depth: SelectionDepth;
}>;
export type EditorToolComponent = Readonly<{
  // NOTE: when adding component ToolItems, ensure that the toolItem data type is
  //       added to the desired element so that the keyboard shortcut that focuses
  //       the sideBar provides good UX (SEE: EditorUserInteractions.tsx)
  toolType: 'component';
  component: ({ editor, depth }: EditorToolComponentProps) => ReactElement | null/*allow to be rendered conditionally*/;
}>;

// -- Button ----------------------------------------------------------------------
export type EditorToolButton = Readonly<{
  toolType: 'button';

  /** The label displayed on the button */
  label: string;

  /** Optional icon to display on the button. If no icon is provided the label is
   *  be used instead */
  icon?: ReactElement;
  /** A label that will be shown when the user mouses over the button.*/
  tooltip: string;

  /** Optional function that determinate if the ToolItem is active or not. This means
   *  that the button will be displayed with an active state indicator. If not provided
   *  the Editor will use the name instead. */
  isActive?: (editor: Editor, depth: SelectionDepth) => boolean;

  /** Callback to be used when the button is clicked */
  onClick: (editor: Editor, depth: SelectionDepth) => void;
}>;
