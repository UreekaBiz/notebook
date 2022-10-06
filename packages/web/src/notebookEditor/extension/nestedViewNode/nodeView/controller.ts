import { chainCommands, newlineInCode } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import { StepMap } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import { getPosType, NestedViewNodeType } from '@ureeka-notebook/web-service';

import { AbstractNodeController } from 'notebookEditor/model/AbstractNodeController';
import { NodeViewStorage } from 'notebookEditor/model/NodeViewStorage';
import { PM_SELECTED_CLASS } from 'notebookEditor/theme/theme';

import { nestedViewNodeBehaviorCommand } from '../command';
import { nestedViewNodePluginKey } from '../plugin';
import { AbstractNestedViewNodeModel } from './model';
import { AbstractNestedViewNodeView } from './view';

// ********************************************************************************
// NOTE: since the View of an Editable Inline Node with Content involves setting
//       up a second EditorView, the approach to handle its updates and the
//       states where the inner View is shown, while not
//       messing collaborative environments is the recommended one in ProseMirror's
//       footnote example. The steps from the inner View are applied to the
//       outer View with an appropriate offset
//       REF: https://prosemirror.net/examples/footnote/

// == Constant ====================================================================
const FROM_OUTSIDE_META = 'fromOutside'/*(SEE: NOTE above)*/;

// ================================================================================
// NOTE: AbstractNestedNodeViewNodeStorageType is not meant to be used directly, is just
//       a placeholder for the type of the AbstractNode controller, model and view.
//       The unknown and any types used in AbstractNestedNodeViewNodeController are used to
//       fill the generic values and don't represent the actual type of the Storage,
//       it will be replaced with actual values when this class is extended.
export type AbstractNestedNodeViewNodeStorageType = NodeViewStorage<AbstractNestedNodeViewNodeController<any, any, any, any>>;
export abstract class AbstractNestedNodeViewNodeController<NodeType extends NestedViewNodeType, Storage extends AbstractNestedNodeViewNodeStorageType, NodeModel extends AbstractNestedViewNodeModel<NodeType, Storage> = any, NodeView extends AbstractNestedViewNodeView<NodeType, Storage, NodeModel> = any> extends AbstractNodeController<NestedViewNodeType, AbstractNestedNodeViewNodeStorageType, NodeModel, NodeView> {
  // == ProseMirror ===============================================================
  // .. Selection .................................................................
  public selectNode() {
    if(!this.editor.view.editable) return/*nothing to do*/;

    this.nodeView.dom.classList.add(PM_SELECTED_CLASS);
    if(!this.nodeModel.isEditing) {
      this.openInnerView();
    } /* else -- already editing, no need to do anything */
  }

  public deselectNode() {
    this.nodeView.dom.classList.remove(PM_SELECTED_CLASS);

    if(this.nodeModel.isEditing) {
      this.closeInnerView();
    } /* else -- no longer editing, no need to do anything */
  }

  // .. Update ....................................................................
  // to handle updates from outside (i.e. through collaborative editing) or when
  // the user undoes something, which is handled by the outer View, find the
  // difference between the current Node content and the content of the new Node.
  // Only replace the changed part, so that the cursor remains in place
  // whenever possible. (SEE: NOTE at the top of this file)
  public update(node: NestedViewNodeType) {
    if(!super.update(node)) return false/*invalid Node type*/;
    if(!node.sameMarkup(this.node)) return false/*invalid Node markup*/;

    // else -- valid Node, sync the inner View
    if(this.nodeView.innerView) {
      const innerViewState = this.nodeView.innerView.state;

      const start = node.content.findDiffStart(innerViewState.doc.content);
      // explicitly check since start can be 0
      if(start !== null && start !== undefined) {
        const diff = node.content.findDiffEnd(innerViewState.doc.content);
        if(diff) {
          let { a: endA, b: endB } = diff;
          const overlap = start - Math.min(endA, endB);
          if(overlap > 0) {
            endA += overlap;
            endB += overlap;
          } /* else -- no need to account for any overlap */
          this.nodeView.innerView.dispatch(innerViewState.tr.replace(start, endB, node.slice(start, endA)).setMeta(FROM_OUTSIDE_META, true));
        } /* else -- the content of the innerView and the received node are not different at the end */
      } /* else -- the content of the innerView and the received node are not different at the start */
    } /* else -- the innerView is not open, do not dispatch steps */

    if(!this.nodeModel.isEditing) {
      this.nodeView.renderNodeContent();
    } /* else -- not editing, no need to render the Node's content */

    return true/*updated*/;
  }

  // in order for a NodeView to get reused
  // it must have been destroyed at least once before (and hence recreated).
  // Since the lifecycle of the View
  // involves removing its View elements from the DOM, they must be
  // set up again
  public updateProps(getPos: getPosType): void {
    // do the default behavior
    super.updateProps(getPos);

    // ensure the contents of the reused EINwC are rendered correctly
    this.nodeView.setupView();
    this.nodeView.renderNodeContent();
  }

  // .. Destroy ...................................................................
  // called when the NodeView is destroyed. The conditions that trigger this are
  // determined by ProseMirror (e.g. splitting a Paragraph that contains an
  // EINwC will trigger the destroy). The View must account for this possibility
  // (SEE: #setupView, #renderNodeContent)
  public destroy() {
    // do the default behavior
    super.destroy();

    this.closeInnerView();
  }

  // .. Event .....................................................................
  // prevent the outer View from trying to handle the DOM events that bubble up
  // from the inner View. Events for which this method returns true are not
  // handled by the outer View
	public stopEvent(event: Event): boolean {
		return (this.nodeView.innerView !== undefined/*the inner View is being displayed*/)
			&& (event.target !== undefined/*the event target is defined*/)
			&& this.nodeView.innerView.dom.contains(event.target as Node/*by definition*/)/*the event happened in the inner View*/;
	}

  // .. Mutation ..................................................................
  /**
   * Ignore all mutations that happen for this View, regardless of their type,
   * so that they are handled by the outer editor
   * (SEE: NOTE at the top of this file)
   */
  public ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element; }) {
    return true/*(SEE: Comment above)*/;
  }

  // == Inner Editor ==============================================================
  /** * Called when the inner View should open */
  private openInnerView() {
    if(this.nodeView.innerView) { console.warn('Inner Nested View should not exist'); return/*something went wrong*/; }
    if(!this.nodeView.innerViewDisplayContainer) {
      console.warn('No InnerViewDisplayContainer');
      return/*no place to render the inner View*/;
    }

    // create a nested ProseMirror view
    this.nodeView.innerView = new EditorView(this.nodeView.innerViewDisplayContainer, {
      state: EditorState.create({
        doc: this.node,
        plugins: [keymap(
          {
            'ArrowUp': () => {
              if(!this.nodeView.innerView) return false/*no inner View*/;
              return nestedViewNodeBehaviorCommand(this.nodeView.outerView, this.node.type.name, 'before'/*place cursor before the Node*/, this.nodeView.innerView.endOfTextblock('up'))(this.nodeView.innerView.state, this.nodeView.innerView.dispatch);
            },
            'ArrowRight': () => {
              if(!this.nodeView.innerView) return false/*no inner View*/;
              return nestedViewNodeBehaviorCommand(this.nodeView.outerView, this.node.type.name, 'after'/*place cursor after the Node*/, this.nodeView.innerView.endOfTextblock('right'))(this.nodeView.innerView.state, this.nodeView.innerView.dispatch);
            },
            'ArrowDown': () => {
              if(!this.nodeView.innerView) return false/*no inner View*/;
              return nestedViewNodeBehaviorCommand(this.nodeView.outerView, this.node.type.name, 'after'/*place cursor before the Node*/, this.nodeView.innerView.endOfTextblock('down'))(this.nodeView.innerView.state, this.nodeView.innerView.dispatch);
            },
            'ArrowLeft': () => {
              if(!this.nodeView.innerView) return false/*no inner View*/;
              return nestedViewNodeBehaviorCommand(this.nodeView.outerView, this.node.type.name, 'before'/*place cursor before the Node*/, this.nodeView.innerView.endOfTextblock('left'))(this.nodeView.innerView.state, this.nodeView.innerView.dispatch);
            },
            'Backspace': (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined) => {
              if(!dispatch) return false/*nothing to do*/;

              if(!state.selection.empty) {
                // just remove the inner Selection
                dispatch(state.tr.deleteSelection().scrollIntoView());
                return true/*handled*/;
              } /* else -- check if at start of Doc */

              // default backspace behavior when NestedViewNode is not empty
              if(this.node.textContent.length > 0) return false/*let the inner View handle the event*/;

              // remove the Node by replacing it with Text
              this.nodeView.outerView.dispatch(this.nodeView.outerView.state.tr.insertText(''));
              this.nodeView.outerView.focus();
              return true/*nothing left to do*/;
            },

            'Cmd-Backspace': () => {
              // delete Node and focus the outer view
              this.nodeView.outerView.dispatch(this.nodeView.outerView.state.tr.insertText(''));
              this.nodeView.outerView.focus();
              return true/*handled*/;
            },

            'Shift-Enter': nestedViewNodeBehaviorCommand(this.nodeView.outerView, this.node.type.name, 'after'/*place cursor after the Node*/, true/*meant to leave the inner View*/),
            'Enter': chainCommands(newlineInCode, nestedViewNodeBehaviorCommand(this.nodeView.outerView, this.node.type.name, 'after'/*place cursor after the Node*/, true/*meant to leave the inner View*/)),

            // bind undo and redo to the outer View, since Transactions in the inner View
            // ensure that the outer one reflects them appropriately
            // (SEE: NOTE at the top of the file)
            'Mod-z': () => undo(this.nodeView.outerView.state, this.nodeView.outerView.dispatch),
            'Mod-Shift-z': () => redo(this.nodeView.outerView.state, this.nodeView.outerView.dispatch),

            'Tab': (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined) => {
              if(!dispatch) return false/*nothing to do*/;

              dispatch(state.tr.insertText('\t'));
              return true/*handled*/;
            },

            'Cmd-a': selectAllInsideNestedView,
            'Cmd-A': selectAllInsideNestedView,
          })],
      }),
      dispatchTransaction: this.dispatchInner.bind(this),
    });

    // request outer cursor position before Node was selected
    const maybePrevCursorPos = nestedViewNodePluginKey.getState(this.nodeView.outerView.state)?.prevCursorPos;
    if(maybePrevCursorPos === undefined/*explicit check since it can be 0*/) console.warn('unable to get NestedViewNode plugin state from key');

    // compute the position that the cursor should appear in the expanded Node
    const prevCursorPos: number = maybePrevCursorPos ?? 0/*set at the start of the Node by default*/;

    let innerViewPos = this.node.nodeSize - 2/*set the selection at the end of the Node by default*/;
    if(prevCursorPos <= this.getPos()) {
      innerViewPos = 0;
    } /* else -- no need to modify the innerView position */

    // NOTE: focusing and setting the position after the innerViewPos has been
    //       computed so that the outerView's selection is not modified incorrectly
    const { state: innerViewState } = this.nodeView.innerView;
    this.nodeView.innerView.focus()/*focus the innerView*/;
    this.nodeView.innerView.dispatch(innerViewState.tr.setSelection(TextSelection.create(innerViewState.doc, innerViewPos)))/*set Selection inside*/;
    this.nodeModel.isEditing = true/*by definition*/;
  }

  // the dispatch function for the inner View of the Node
  private dispatchInner(tr: Transaction) {
    if(!this.nodeView.innerView) return/*inner View not set, nothing to do*/;

    // update the inner View regularly
    const { state, transactions } = this.nodeView.innerView.state.applyTransaction(tr);
    this.nodeView.innerView.updateState(state);

    // update the outer View so that positions do not go into conflict
    // after applying the changes on the inner View
    if(!tr.getMeta(FROM_OUTSIDE_META)) {
      const outerTr = this.nodeView.outerView.state.tr;
      const offsetMap = StepMap.offset(this.getPos() + 1/*inside this Node*/);

      for(let i = 0; i < transactions.length; i++) {
        const steps  = transactions[i].steps;

        for(let j = 0; j < steps.length; j++) {
          const mapped = steps[j].map(offsetMap);
          if(!mapped) throw Error(`Step discarded: ${steps[j].map(offsetMap)}`);

          outerTr.step(mapped);
        }
      }
      if(outerTr.docChanged) {
        this.nodeView.outerView.dispatch(outerTr);
      } /* else -- outerView did not change, do nothing */
    }
  }

  /**
   * Called when the inner View should close
   */
  private closeInnerView() {
    if(this.nodeView.innerView) {
      this.nodeView.innerView.destroy();
      this.nodeView.innerView = undefined/*default*/;
    } /* else -- no innerView is being rendered, no need to destroy it */

    this.nodeView.renderNodeContent();
    this.nodeModel.isEditing = false/*by definition*/;
    this.nodeView.outerView.focus();
  }
}

// == Util ========================================================================
// NOTE: not a Command since only the Inner View contents are meant to be selected
const selectAllInsideNestedView = (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined) => {
  if(!dispatch) return false/*nothing to do*/;

  const { tr } = state;
  const { parentStart, parentEnd } = computeInnerViewSelection(state);
  if(tr.selection.from === parentStart && tr.selection.to === parentEnd) return false/*already selected all inside this NestedViewNode*/;

  tr.setSelection(TextSelection.create(tr.doc, parentStart, parentEnd));
  dispatch(tr);
  return true/*handled*/;
};

// compute the Selection Range that has the whole contents of the inner View
const computeInnerViewSelection = (state: EditorState) => {
  const { tr } = state;
  const { $from } = tr.selection;
  const { parent, parentOffset } = $from;
  const parentStart = $from.pos - parentOffset/*still inside the NVN, account for start and end*/;
  const parentEnd = parentStart + parent.nodeSize - 2/*still inside the NVN, account for start and end*/;

  return { parentStart, parentEnd };
};
