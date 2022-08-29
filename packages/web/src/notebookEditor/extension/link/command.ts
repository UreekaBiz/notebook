import { EditorState, Transaction } from 'prosemirror-state';

import { AbstractDocumentUpdate, Command, LinkAttributes, MarkName, SetMarkDocumentUpdate, ToggleMarkDocumentUpdate, UnsetMarkDocumentUpdate, PREVENT_LINK_META } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: the desired behavior for these Commands is that creating a Link in a
//       Range that includes Nodes that should not have Links (e.g. a Selection
//       that spans Text and CodeBlock Nodes) should create two separate Links,
//       one before the CodeBlock and another one past it

// == Implementation ==============================================================
/** set the Link Mark across the current Selection */
export const setLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  const updatedTr = new SetLinkDocumentUpdate(attributes).update(state, state.tr);
  dispatch(updatedTr);
  return true/*command executed*/;
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
  const updatedTr = new UnsetLinkDocumentUpdate().update(state, state.tr);
  dispatch(updatedTr);
  return true/*command executed*/;
};
export class UnsetLinkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/}

  /*
   * modify the given Transaction such that a the Link Mark
   * is unset across the current Selection, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
    const updatedTr = new UnsetMarkDocumentUpdate(MarkName.LINK, true/*extend empty Mark Range*/).update(editorState, tr);
    return updatedTr;
  }
}

// --------------------------------------------------------------------------------
/**
 * set or unset the Link Mark across the current Selection depending on
 * whether or not it is currently active
 */
export const toggleLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  const updatedTr = new ToggleLinkDocumentUpdate(attributes).update(state, state.tr);
  dispatch(updatedTr);
  return true/*command executed*/;
};
export class ToggleLinkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly attributes: Partial<LinkAttributes>) {/*nothing additional*/}

  /*
   * modify the given Transaction such that a the Link Mark
   * is set or unset across the current Selection, depending
   * on whether or not it is currently active, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
    const updatedTr = new ToggleMarkDocumentUpdate(MarkName.LINK, this.attributes).update(editorState, tr);
    return updatedTr;
  }
}
