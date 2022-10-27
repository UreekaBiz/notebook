import { Editor } from '@tiptap/core';
import { EditorView } from 'prosemirror-view';

import { getNestedViewNodeTextString, getPosType, NestedViewNodeType, DATA_NODE_TYPE, NESTED_VIEW_NODE_EMPTY_NODE_CLASS, NESTED_NODE_VIEW_INNER_VIEW_DISPLAY_CONTAINER_CLASS, NESTED_NODE_VIEW_RENDER_DISPLAY_CONTAINER_CLASS } from '@ureeka-notebook/web-service';

import { AbstractNodeView } from 'notebookEditor/model/AbstractNodeView';

import { AbstractNestedNodeViewNodeStorageType } from './controller';
import { AbstractNestedViewNodeModel } from './model';

// ********************************************************************************
/** Abstract class that serves as the base view for all NestedViewNodes */
export abstract class AbstractNestedViewNodeView<NodeType extends NestedViewNodeType, Storage extends AbstractNestedNodeViewNodeStorageType, NodeModel extends AbstractNestedViewNodeModel<NodeType, Storage>> extends AbstractNodeView<NestedViewNodeType, AbstractNestedNodeViewNodeStorageType, NodeModel> {
  // == Attribute =================================================================
  // the DOM Node container for the rendered version of this Node
	public renderDisplayContainer: HTMLElement | undefined;

  // the DOM Node container where the inner View rendered version of this
  // Node is displayed
	public innerViewDisplayContainer: HTMLElement | undefined;

  // a reference to the regular Editor View
  public outerView: EditorView;

  // a reference to the inner Editor View that is used to change
  // this Node's content
	public innerView: EditorView | undefined;

  // == Lifecycle =================================================================
  public constructor(model: NodeModel, editor: Editor, node: NodeType, storage: Storage, getPos: getPosType) {
    super(model, editor, node, storage, getPos);

    // .. Setup ...................................................................
    this.outerView = editor.view/*by definition*/;

    // .. DOM Layout ..............................................................
    this.setupView();

    // .. Functionality ..........................................................,
    this.addEventListener();

    // .. Initial Content Render ..................................................
		this.renderNodeContent();
  }

  // -- Creation ------------------------------------------------------------------
  // create the DOM element that will hold this Node
  protected createDomElement() {
    const dom = this.node.isInline
      ? document.createElement('span')
      : document.createElement('div');

    // prevent any dragging behavior for the Node
    dom.ondragstart = () => false;
    dom.ondrop = () => false;
    dom.draggable = false;

    dom.setAttribute(DATA_NODE_TYPE, this.node.type.name);
    return dom;
  }

  // -- Destroy -------------------------------------------------------------------
  // remove the event Listener. The default destroy behavior is implemented
  // by the Controller. (SEE: ./controller.ts)
  public destroy() {
    this.dom.removeEventListener('click', this.ensureFocus);
  }

  // -- Functionality -------------------------------------------------------------
  // (SEE: #ensureFocus below)
  private addEventListener() {
    this.dom.addEventListener('click', this.ensureFocus);
  }
  /**
   * ensure focus gets set to the inner Editor whenever this Node has focus,
   * which prevents accidental deletions.
   */
  public ensureFocus() {
    if(this.innerView && this.outerView.hasFocus()) {
      this.innerView.focus();
    } /* else -- inner View does not exist or is already focused, do nothing */
  }

	// == Rendering =================================================================
  // set up the Node's DOM layout so that the Content of the Node can be rendered
  // correctly. This should happen on creation and every time the View gets reused
  public setupView() {
    if(!this.renderDisplayContainer) {
      this.renderDisplayContainer = document.createElement('span');
      this.renderDisplayContainer.classList.add(NESTED_NODE_VIEW_RENDER_DISPLAY_CONTAINER_CLASS);
      this.dom.appendChild(this.renderDisplayContainer);
    } /* else -- already set up */

    if(!this.innerViewDisplayContainer) {
      this.innerViewDisplayContainer = document.createElement('span');
      this.innerViewDisplayContainer.classList.add(NESTED_NODE_VIEW_INNER_VIEW_DISPLAY_CONTAINER_CLASS);
      this.dom.appendChild(this.innerViewDisplayContainer);
    } /* else -- already set up, do nothing */
  }

  // displays the content of this Node in a special way that does not involve
  // showing the inner View. This can vary per implementation
  // and its meant to provide another representation of the Node's content when
  // the inner View is not active
	public renderNodeContent() {
    if(!this.renderDisplayContainer) return/*not set yet, nothing to do*/;

		// get text string to render
    const textString = getNestedViewNodeTextString(this.node);
		if(textString.length < 1) {
			this.dom.classList.add(NESTED_VIEW_NODE_EMPTY_NODE_CLASS);

			// clear rendered DOM Nodes, since this Node is in an invalid state
			while(this.renderDisplayContainer.firstChild){
        this.renderDisplayContainer.firstChild.remove();
      }
      return/*nothing left to do*/;
		} /* else -- not empty */

    this.dom.classList.remove(NESTED_VIEW_NODE_EMPTY_NODE_CLASS);

    // show the representation of the content of this Node
    this.renderDisplayContainer.firstChild?.remove();
    const newRenderDisplayChild = document.createElement('span');
          newRenderDisplayChild.innerHTML = this.getRenderString(textString);
    this.renderDisplayContainer.appendChild(newRenderDisplayChild);
  }

  /**
   * function used to define how the NestedViewNode's content will be shown
   * (as an HTML string) when the cursor is not inside the NestedViewNode.
   *
   * Should be re-implemented for all NestedViewNodes that require a specific
   * render behavior for their content.
   *
   * @param textString the string that is currently inside
   * the NestedViewNode (its Text Content)
   *
   * @returns the content that will be set as the innerHTML of the renderDisplayContainer
   */
  public getRenderString(textString: string): string {
    return `Length: ${textString.length}`;
  }
}
