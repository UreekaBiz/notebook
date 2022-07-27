import { Editor } from '@tiptap/core';
import { ReactNode } from 'react';

import { NodeName } from '@ureeka-notebook/web-service';

import { SelectionDepth } from 'notebookEditor/model/type';

// ********************************************************************************
// == Toolbar =====================================================================
export type Toolbar = Readonly<{
  /**
   * Title that is being displayed on the toolbar. If not provided nodeName will
   * be used instead.
   */
  title?: string;
  /**
   * Unique name of the toolbar, its must correspond to the specific Node that it
   * is associated with.
   */
  nodeName: NodeName;

  /** Optional component that will be displayed on the right side of the title. */
  rightContent?: (props: EditorToolComponentProps) => ReactNode | null/*allow to be rendered conditionally*/;

  /** A collection of EditorToolItems that correspond to the toolbar. */
  toolsCollections: ToolItem[][];
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
  shouldBeDisabled?: (editor: Editor) => boolean;
  /** Defaults to always show if not provided  */
  shouldShow?: (editor: Editor, depth: SelectionDepth) => boolean;

  /**
   * A schema that defines if the ToolItem can be rendered.
   * NOTE: This differs from shouldShow this validation schema are requirements to
   *       determinate if the ToolItem can exists with the given editor state and
   *       prevent errors, while shouldShow is a utility to hide the ToolItem from
   *       the user improving the UX.
   *       If this validation schema fails that means that there is a bug in the
   *       logic that renders the ToolItem.
   */
  validationSchema?: ToolItemValidationSchema;
}> & (EditorToolComponent | EditorToolButton);

// -- Validation ------------------------------------------------------------------
// A collection of validators that can be used to validate if the tool item can be
// rendered.
// NOTE: The validation schema --must-- be used to prevent errors, it logs when
//       the validation fails. If the ToolItem should be hidden from the user by
//       UX reasons shouldShow should be used instead.
export type ToolItemValidationSchema = {
  /**
   * The current selected node match the given node. If not provided any node
   * selected can use the ToolItem.
   * NOTE: If this value is present it will treat as if nodeSelection is set to
   *       true since the Selection must be a NodeSelection in order to have a
   *       selected Node.
   * */
  node?: NodeName;
  /** The current selection is an instance of NodeSelection */
  nodeSelection?: boolean;

  /**
   * Function that validates if the tool item can be renderer based on the given
   * props. If the return value is false, the Tool Item won't be rendered.
   */
  validator?: ToolItemValidator;
};
export type ToolItemValidator = (editor: Editor, depth: SelectionDepth) => boolean;

// -- Component -------------------------------------------------------------------
// NOTE: Must be in sync with the parameters of the component property in
//       EditorToolComponent.
export type EditorToolComponentProps = Readonly<{
  /** An instance of the Editor that is being used.*/
  editor: Editor;
  /**
   * The depth of the current Selection.
   * @see SelectionDepth
   */
  depth: SelectionDepth;
}>;
export type EditorToolComponent = Readonly<{
  // NOTE: When adding component ToolItems, ensure that the toolItem data type is
  //       added to the desired element so that the keyboard shortcut that focuses
  //       the sideBar provides good UX (SEE: EditorUserInteractions.tsx)
  toolType: 'component';
  component: ({ editor, depth }: EditorToolComponentProps) => ReactNode | null/*allow to be rendered conditionally*/;
}>;

// -- Button ----------------------------------------------------------------------
export type EditorToolButton = Readonly<{
  toolType: 'button';

  /** The label displayed on the button.*/
  label: string;

  /**
   * An option icon to display on the button. If no icon is provided the label will
   * be used instead.
   */
  icon?: ReactNode;
  /** A label that will be shown when the user mouses over the button.*/
  tooltip: string;

  /**
   * Option function that determinate if the ToolItem is active or no. This means that
   * the button will be displayed with an active state indicator. If not provided the
   * editor will use the name instead.
   */
  isActive?: (editor: Editor) => boolean;

  /** Callback to be used when the button is clicked. */
  onClick: (editor: Editor, depth: SelectionDepth) => void;
}>;
