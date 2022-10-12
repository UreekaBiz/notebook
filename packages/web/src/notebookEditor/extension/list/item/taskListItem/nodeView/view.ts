import { Editor } from '@tiptap/core';

import { camelToKebabCase, getPosType, isGetPos, AttributeType, JustifyContent, NodeName, TaskListItemNodeType, DATA_NODE_TYPE, TextAlign, justifyContentToTextAlign } from '@ureeka-notebook/web-service';

import { NoStorage } from 'notebookEditor/model/type';
import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { TaskListItemModel } from './model';
import { crossTaskListItemCommand } from '../command';

// ********************************************************************************
// NOTE: this NodeView does not use React since TaskListItems do not have a
//       complex structure, nor do they require a Storage or an Id
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

    // setup View functionality
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
    // NOTE: there is no need to update any other DOM element for the view besides
    //       setting this attribute, which has to be set through the .checked
    //       property. Otherwise the DOM elements won't reflect the changes
    this.checkBox.checked = this.node.attrs.checked ? true : false;

    const justifyContent = this.node.attrs[AttributeType.JustifyContent];
    if(!justifyContent) return/*nothing to do, use defaults*/;

    this.dom.style.justifyContent = camelToKebabCase(justifyContent);
    if(!this.contentDOM) return/*nothing left to do*/;

    if(justifyContent === JustifyContent.justify) {
      this.dom.style.justifyContent = camelToKebabCase(JustifyContent.start/*default*/);
      this.contentDOM.style.textAlign = TextAlign.justify;
      return/*nothing left to do*/;
    } else {
      this.contentDOM.style.textAlign = justifyContentToTextAlign(justifyContent);
    }
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
    if(!isGetPos(this.getPos)) throw new Error('getPos is not a function');

    const { checked } = event.target;
    const thisNodePos = this.getPos();

    crossTaskListItemCommand(thisNodePos, checked)(this.editor.state, this.editor.view.dispatch);
  }
}

// == Type Guard ==================================================================
const isHTMLInputElement = (target: EventTarget | null): target is HTMLInputElement => target !== null && target instanceof HTMLInputElement;
const isCheckBoxInputElement = (element: HTMLInputElement) => element.type === 'checkbox';
