import { Editor } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state';

import { getPosType, isGetPos, MarkName, NodeName, TaskListItemNodeType, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { NoStorage } from 'notebookEditor/model/type';
import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { TaskListItemModel } from './model';

// ********************************************************************************
export class TaskListItemView extends AbstractNodeView<TaskListItemNodeType, NoStorage, TaskListItemModel> {
  // == Attribute =================================================================
  /** DOM element used to display the checkBox */
  private checkBox: HTMLInputElement;

  // == Lifecycle =================================================================
  public constructor(model: TaskListItemModel, editor: Editor, node: TaskListItemNodeType, codeBlockStorage: NoStorage, getPos: getPosType) {
    super(model, editor, node, codeBlockStorage, getPos);

    // .. UI ......................................................................
    // Create DOM elements and append it to the outer container (dom)
    const checkBoxWrapper = document.createElement('label');
          checkBoxWrapper.contentEditable = 'false'/*wrapper is not editable*/;

    const checkBox = document.createElement('input');
          checkBox.type = 'checkBox';
    checkBoxWrapper.append(checkBox);

    const contentWrapper = document.createElement('div');

    // append both DOM elements as direct children to the dom element
    this.dom.append(checkBoxWrapper, contentWrapper);
    this.checkBox = checkBox;

    // setup view functionality
    this.addEventListener();

    // .. ProseMirror .............................................................
    // Tell PM that the content fo the node must go into the paragraph element,
    // by delegating keeping track of the it to PM (SEE: NodeView#contentDOM)
    this.contentDOM = contentWrapper;
  }

  // -- Creation ------------------------------------------------------------------
  protected createDomElement() {
    const taskListItem = document.createElement('li');
          taskListItem.setAttribute(DATA_NODE_TYPE, NodeName.TASK_LIST_ITEM);

    return taskListItem;
  }

  // -- Update --------------------------------------------------------------------
  // update the attributes of the DOM element based on the Node attributes
  public updateView() {
    this.dom.dataset.checked = this.node.attrs.checked ? 'true' : 'false';

    if(this.node.attrs.checked) this.checkBox.setAttribute('checked', 'true');
    else this.checkBox.removeAttribute('checked');
  }

  // -- Destroy -------------------------------------------------------------------
  public destroy() {
    this.checkBox.removeEventListener('change', this.changeHandler.bind(this));
  }

  // -- Event ---------------------------------------------------------------------
  private addEventListener() {
    this.checkBox.addEventListener('change', this.changeHandler.bind(this));
  }

  private changeHandler(event: Event) {
    if(!(isHTMLInputElement(event.target) && isCheckBoxInputElement(event.target))) return/*nothing to do*/;

    // TODO: refactor
    const { checked } = event.target;
    this.editor.chain().focus(undefined/*focus at current selection*/, { scrollIntoView: false /*do not make window scroll*/ }).command((props) => {
      const { dispatch, tr } = props;
      if(!dispatch) throw new Error('dispatch undefined when it should not');
      if(!isGetPos(this.getPos)) throw new Error('getPos is not a function');

      const thisNodePos = this.getPos();
      const currentNode = tr.doc.nodeAt(thisNodePos);
      if(!currentNode) return false/*Node does not exist*/;

      // NOTE: only on firstChild so that the content of other nested
      //       TaskListItems do not receive the Strikethrough Mark
      const { firstChild } = currentNode;
      if(!firstChild) return false/*first child does not exist*/;

      // update the attributes and set the corresponding marks based on the
      // checked value
      const { pos: startingAnchor } = tr.selection.$anchor,
            { pos: startingHead } = tr.selection.$head;

      if(checked) {
        tr.setNodeMarkup(thisNodePos, undefined, { ...currentNode.attrs, checked })
          .addMark(thisNodePos + 1/*inside the node*/,
                   thisNodePos + firstChild.nodeSize,
                   this.editor.schema.marks[MarkName.STRIKETHROUGH].create())
          .setSelection(new TextSelection(tr.doc.resolve(startingAnchor), tr.doc.resolve(startingHead)));
      } else {
        tr.setNodeMarkup(thisNodePos, undefined, { ...currentNode.attrs, checked })
          .removeMark(thisNodePos + 1/*inside the node*/,
                      thisNodePos + firstChild.nodeSize,
                      undefined/*remove all marks of any type*/)
          .setSelection(new TextSelection(tr.doc.resolve(startingAnchor), tr.doc.resolve(startingHead)));
      }

      dispatch(tr);
      return true/*node updated*/;
    }).run();
  }
}

// == Type Guard ==================================================================
const isHTMLInputElement = (target: EventTarget | null): target is HTMLInputElement => target !== null && target instanceof HTMLInputElement;
const isCheckBoxInputElement = (element: HTMLInputElement) => element.type === 'checkbox';
