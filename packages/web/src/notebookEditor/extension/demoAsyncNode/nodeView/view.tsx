import { Editor } from '@tiptap/core';
import { getPosType, DemoAsyncNodeType } from '@ureeka-notebook/web-service';

import { AbstractCodeBlockAsyncNodeView } from 'notebookEditor/extension/codeBlockAsyncNode/nodeView/view';
import { WrapReactNodeView } from 'notebookEditor/model/ReactNodeView';

import { DemoAsyncNodeStorageType } from './controller';
import { DemoAsyncNodeComponent, DemoAsyncNodeComponentProps } from './jsx';
import { DemoAsyncNodeModel } from './model';

// ********************************************************************************
export class DemoAsyncNodeView extends AbstractCodeBlockAsyncNodeView<string, DemoAsyncNodeType, DemoAsyncNodeStorageType, DemoAsyncNodeModel> {
  constructor(model: DemoAsyncNodeModel, editor: Editor, node: DemoAsyncNodeType, asyncNodeStorage: DemoAsyncNodeStorageType, getPos: getPosType) {
    super(model, editor, node, asyncNodeStorage, getPos);

    // .. UI ......................................................................
    this.reactNodeView = (props) => WrapReactNodeView(
      null/*no contentDOM*/,
      props,
      // FIXME: Types!
      (props) => <DemoAsyncNodeComponent {...props as unknown as DemoAsyncNodeComponentProps} />,
      {/*no options*/}
    );

    // Sync view with current state
    this.updateView();
  }
}
