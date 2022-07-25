import { Editor } from '@tiptap/core';
import { ReactNode } from 'react';

import { NotebookEditorService, NotebookIdentifier, NodeName } from '@ureeka-notebook/web-service';

import { SelectionDepth } from 'notebookEditor/model/type';

// ********************************************************************************
// == Toolbar =====================================================================
export type EditorToolbar = Readonly<{
  title?: string/*toolbar specific title. If given, different controls for Toolbar traversal will apply (SEE: web/src/notebook/toolbar.ts/*/;

  nodeName: NodeName/*unique name used by the editor*/;

  rightContent?: (editor: Editor) => ReactNode;

  toolsCollections: EditorTool[][];
}>;

// == Tool ========================================================================
export type EditorToolType = 'button' | 'component';
export type EditorToolName = string/*alias*/;
export type EditorTool = Readonly<{
  toolType: EditorToolType;

  name: EditorToolName/*unique name used by the editor*/;

  shouldBeDisabled?: (editor: Editor) => boolean;
  shouldShow?: (editor: Editor, depth: SelectionDepth) => boolean;
}> & (EditorToolComponent | EditorToolButton);

// -- Component -------------------------------------------------------------------
// NOTE: must be in sync with the parameters of the component property in EditorToolComponent
export type EditorToolComponentProps = Readonly<{
  editor: Editor;
  depth: SelectionDepth;
  notebookId: NotebookIdentifier | null;
  editorService: NotebookEditorService | null;
}>;
export type EditorToolComponent = Readonly<{
  toolType: 'component';
  component: ({ editor, depth, notebookId, editorService }: EditorToolComponentProps) => ReactNode | null/*allow to be rendered conditionally*/;
}>;

// -- Button ----------------------------------------------------------------------
export type EditorToolButton = Readonly<{
  toolType: 'button';

  label: string;

  icon?: ReactNode;
  tooltip: string;

  /** Editor will decide if active based on tool name*/
  isActive?: (editor: Editor) => boolean;

  onClick: (editor: Editor, depth: SelectionDepth) => void;
}>;
