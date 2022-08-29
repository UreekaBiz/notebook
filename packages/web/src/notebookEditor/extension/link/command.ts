import { EditorState, Transaction } from 'prosemirror-state';

import { setMarkCommand, toggleMarkCommand, unsetMarkCommand, AbstractDocumentUpdate, Command, LinkAttributes, MarkName, SetMarkDocumentUpdate, UnsetMarkDocumentUpdate, PREVENT_LINK_META } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: the desired behavior for these Commands is that creating a Link in a
//       Range that includes Nodes that should not have Links (e.g. a Selection
//       that spans Text and CodeBlock Nodes) should create two separate Links,
//       one before the CodeBlock and another one past it

// == Implementation ==============================================================
/** set the Link Mark across the current Selection */
export const setLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  state.tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
  return setMarkCommand(MarkName.LINK, attributes)(state, dispatch);
};
export class SetLinkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly attributes: Partial<LinkAttributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a the Link Mark
   * is set across the current Selection, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
    const updatedTr = new SetMarkDocumentUpdate(MarkName.LINK, this.attributes).update(editorState, tr);
    return updatedTr;
  }
}

// --------------------------------------------------------------------------------
/** unset the Link Mark across the current Selection */
export const unsetLinkCommand = (): Command => (state, dispatch) => {
  state.tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
  return unsetMarkCommand(MarkName.LINK, true/*extend empty Mark Range*/)(state, dispatch);
};
export class UnsetLinkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly extendEmptyMarkRange: boolean) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a the Link Mark
   * is unset across the current Selection, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
    const updatedTr = new UnsetMarkDocumentUpdate(MarkName.LINK, this.extendEmptyMarkRange).update(editorState, tr);
    return updatedTr;
  }
}

// --------------------------------------------------------------------------------
export const toggleLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  state.tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
  return toggleMarkCommand(MarkName.LINK, attributes)(state, dispatch);
};
