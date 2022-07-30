import { defaultBlockAt, Editor, Node } from '@tiptap/core';
import { Selection, Transaction } from 'prosemirror-state';

import { generateNodeId, isTextStyleMark, isTitleNode, AttributeType, MarkName, NodeName, NotebookSchemaType, SetAttributeType, TitleNodeSpec, TitleNodeType, DATA_NODE_TYPE, isClientSide } from '@ureeka-notebook/web-service';

import { getNodeOutputSpec, setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { safeParseTag } from 'notebookEditor/extension/util/parse';
import { NoOptions } from 'notebookEditor/model/type';

import { onTransactionTitle } from './transaction';
import { TitleStorage } from './type';

// ********************************************************************************
// the default set of Marks to be applied for the Title on creation
const DEFAULT_TITLE_MARKS: MarkName[] = [MarkName.BOLD];

// the Attribute used by CSS to add the placeholder (i.e. 'Untitled') if need be
export const DATA_TITLE_PLACEHOLDER = 'data-title-placeholder';

// == Node ========================================================================
export const Title = Node.create<NoOptions, TitleStorage>({
  ...TitleNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // NOTE: since the Title Node remains the same throughout the whole lifecycle
      //       of the Document, it receives a random Id as its default, and its not
      //       included in the UniqueNodeId extension's 'includedNodes' set
      [AttributeType.Id]: setAttributeParsingBehavior(AttributeType.Id, SetAttributeType.STRING, generateNodeId()),
      [AttributeType.InitialMarksSet]: setAttributeParsingBehavior(AttributeType.InitialMarksSet, SetAttributeType.BOOLEAN, false/*by definition*/),

      [AttributeType.FontSize]: setAttributeParsingBehavior(AttributeType.FontSize, SetAttributeType.STRING),
      [AttributeType.TextColor]: setAttributeParsingBehavior(AttributeType.TextColor, SetAttributeType.STRING),

      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, SetAttributeType.STRING),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, SetAttributeType.STRING),
      [AttributeType.PaddingLeft]: setAttributeParsingBehavior(AttributeType.PaddingLeft, SetAttributeType.STRING),
      [AttributeType.PaddingRight]: setAttributeParsingBehavior(AttributeType.PaddingRight, SetAttributeType.STRING),

      [AttributeType.MarginTop]: setAttributeParsingBehavior(AttributeType.MarginTop, SetAttributeType.STRING),
      [AttributeType.MarginBottom]: setAttributeParsingBehavior(AttributeType.MarginBottom, SetAttributeType.STRING),
      [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STRING),
      [AttributeType.MarginRight]: setAttributeParsingBehavior(AttributeType.MarginRight, SetAttributeType.STRING),
    };
  },

  // -- Commands ------------------------------------------------------------------
  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        // do not allow the Title Node to be deleted (and hence, the Title view to
        // be recreated)
        if(editor.state.selection.$anchor.pos === 1 && editor.state.selection.$head.pos === 1/*at the start of the Title by contract, no selection*/) {
          return true/*do not allow backspace*/;
        }/* else -- selection not at the start of the Title */

        return false;
      },

      // prevent Title from being split on enter by inserting a Paragraph below
      // REF: https://github.com/ProseMirror/prosemirror-commands/blob/20fa086dfe21f7ce03e5a05b842cf04e0a91e653/src/commands.ts
      Enter: ({ editor }) => {
        const { dispatch, state } = editor.view;
        const { $head } = editor.state.selection;
        if(!dispatch) throw new Error('dispatch undefined when it should not');

        const above = $head.node(-1),
              after = $head.indexAfter(-1);
        const type = defaultBlockAt(above.contentMatchAt(after));
        if(!type || !above.canReplaceWith(after, after, type)) return false;

        const filledType = type.createAndFill();
        if(!filledType) throw new Error(`Could not create type: ${type} with filled content`);

        const pos = $head.after();
        const tr = state.tr.replaceWith(pos, pos, filledType);
        tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));

        dispatch(tr.scrollIntoView());
        return true;
      },
    };
  },

  // -- Storage -------------------------------------------------------------------
  // NOTE: the Title Node is a special case since it is the only Node of this kind
  //       that will be created and persisted in the Document.
  // NOTE: Only create when is client-side.
  addStorage() { return { titleView: isClientSide() ?  document.createElement('div') : undefined as any }; },

  // -- Transaction ---------------------------------------------------------------
  onTransaction({ transaction }) {
    const titleBefore = transaction.before.child(0)/*by contract since there is only 1 Title*/,
          titleNow = transaction.doc.child(0)/*by contract since there is only 1 Title*/;
    if(!isTitleNode(titleBefore) || !isTitleNode(titleNow)) return/*nothing to do*/;

    // Apply default styles to the Placeholder if the Title node don't have any
    // content.
    if(!titleNow.attrs.initialMarksSet) {
      carryDefaultPlaceholderStyleOver(this.storage.titleView, transaction);
    }/* else -- marks set already, do not carry placeholder style through transactions */

    // keep the placeholder in sync with the stored marks
    onTransactionTitle(transaction, this.storage);

    // ensure that whenever the whole content of the Title gets deleted,
    // all stored marks get removed, hence resetting the styles of
    // the placeholder as well (SEE: ./transaction.ts)
    if((titleContentGotDeleted(titleBefore, titleNow))) {
      setEmptyMarks(this.editor);
    }/* else -- title still has content, do not dispatch transaction */
  },

  // -- Update --------------------------------------------------------------------
  // do not allow the Document itself to be selected (position 0)
  onSelectionUpdate() {
    const { selection } = this.editor.state;
    if(!(selection.$anchor.pos === 0)) return;
    /* else -- user backspaced paragraph start right below Title node */
    this.editor.commands.setTextSelection(1/*inside the Title*/);
  },

  // -- View ----------------------------------------------------------------------
  // NOTE: A JS NodeView is being used to maintain easy access to the first created
  //       titleView, which whose reference is in the Storage of this extension
  addNodeView() {
    return ({ node }) => {
      // FIXME: the styles from the Theme are being applied to the titleView DOM
      //        element directly which could sound right but in practice when
      //        adding Attributes or Marks such as textStyles they are not being
      //        applied to the same Node. In this situation some kind of system to
      //        differentiate between the nodeView container and the content DOM
      //        should be implemented.
      // NOTE:  the specific problem is that updating the fontSize of the Title
      //        using textStyle add the Mark to contentDOM but doesn't overrides
      //        the styles from the DOM element
      this.storage.titleView.setAttribute('id', `${NodeName.TITLE}-${node.attrs.id}`);
      this.storage.titleView.setAttribute(`${DATA_NODE_TYPE}`, NodeName.TITLE);

      return {
        dom: this.storage.titleView,
        contentDOM: this.storage.titleView /*put content inside the div itself*/,
        ignoreMutation(mutation) {
          // do not re compute the selection when the attributes of the Title
          // are modified. This is here specifically to prevent wrong behavior
          // when user does Ctrl/Cmd + A and the Title is empty
          return mutation.type === 'attributes';
        },
      };
    };
  },

  parseHTML() { return [safeParseTag(NodeName.TITLE)]; },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});

// == Util ========================================================================
const carryDefaultPlaceholderStyleOver = (titleView: HTMLDivElement, transaction: Transaction<NotebookSchemaType>) => {
  // NOTE: TextStyle is a special case since the only effect it can have on the
  //       placeholder is changing its fontSize. This check's purpose is to
  //       specifically also include the textStyle mark before the initialMarks
  //       have been set for the Title. Afterwards the onTransactionTitle will
  //       perform these checks (SEE: ./transaction.ts)
  transaction.storedMarks?.forEach(storedMark => {
    if(isTextStyleMark(storedMark)) {
      titleView.setAttribute('style', `font-size: ${storedMark.attrs.fontSize}`);
    }/* else -- ignore mark, just apply defaults */
  });
  titleView.setAttribute(DATA_TITLE_PLACEHOLDER, 'Untitled'/*by definition*/);
  DEFAULT_TITLE_MARKS.forEach(markName => titleView.classList.add(markName));
};

const titleContentGotDeleted = (titleBefore: TitleNodeType, titleNow: TitleNodeType) => titleBefore.content.size > 1 && titleNow.content.size < 1 && titleNow.attrs.initialMarksSet;

const setEmptyMarks = (editor: Editor) => editor.chain().command((props) => {
  const { dispatch, tr } = props;
  if(!dispatch) throw new Error('dispatch undefined when it should not');

  tr.setStoredMarks([/*remove stored marks*/]);
  dispatch(tr);
  return true/*transaction dispatched*/;
}).run();
