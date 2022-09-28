import { EditorState, TextSelection, Transaction } from 'prosemirror-state';

import { createLinkMark, AbstractDocumentUpdate, Command, LinkAttributes, MarkName, SetMarkDocumentUpdate, UnsetMarkDocumentUpdate, PREVENT_LINK_META } from '@ureeka-notebook/web-service';

// ********************************************************************************
// NOTE: the desired behavior for these Commands is that creating a Link in a
//       Range that includes Nodes that should not have Links (e.g. a Selection
//       that spans Text and CodeBlock Nodes) should create two separate Links,
//       one before the CodeBlock and another one past it

// == Implementation ==============================================================
/** set the Link Mark across the current Selection */
export const setLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  const updatedTr = new SetLinkDocumentUpdate(attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class SetLinkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly attributes: Partial<LinkAttributes>) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that a the Link Mark
   * is set across the current Selection, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
    const updatedTr = new SetMarkDocumentUpdate(MarkName.LINK, this.attributes).update(editorState, tr);
    return updatedTr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
/** unset the Link Mark across the current Selection */
export const unsetLinkCommand = (): Command => (state, dispatch) => {
  const updatedTr = new UnsetLinkDocumentUpdate().update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class UnsetLinkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor() {/*nothing additional*/ }

  /*
   * modify the given Transaction such that a the Link Mark
   * is unset across the current Selection, and return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
    const updatedTr = new UnsetMarkDocumentUpdate(MarkName.LINK, true/*extend empty Mark Range*/).update(editorState, tr);
    return updatedTr/*updated*/;
  }
}

// --------------------------------------------------------------------------------
/**
 * insert Text content into the Editor and apply the Link Mark to it
 */
export const insertLinkCommand = (textContent: string, attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  const updatedTr = new InsertLinkDocumentUpdate(textContent, attributes).update(state, state.tr);
  if(updatedTr) {
    dispatch(updatedTr);
    return true/*Command executed*/;
  } /* else -- Command cannot be executed */

  return false/*not executed*/;
};
export class InsertLinkDocumentUpdate implements AbstractDocumentUpdate {
  public constructor(private readonly textContent: string, private readonly attributes: Partial<LinkAttributes>) {/*nothing additional*/ }

  /*
   * modify the given Transaction such that Text content is inserted
   * into the Editor, it receives the Link Mark, and then return it
   */
  public update(editorState: EditorState, tr: Transaction) {
    const { href } = this.attributes;
    if(!href) return false/*no Link content to insert*/;

    const { from } = editorState.selection;
    const endTo = from + this.textContent.length;

    tr.insert(from, editorState.schema.text(this.textContent))
      .addMark(from, endTo, createLinkMark(editorState.schema, this.attributes))
      .removeMark(endTo, endTo, null/*remove all Marks*/)
      .setSelection(TextSelection.create(tr.doc, endTo, endTo))
      .setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
    return tr/*updated*/;
  }
}
