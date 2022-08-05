import { CodeBlockNodeType } from '@ureeka-notebook/web-service';

import { AbstractNodeModel } from 'notebookEditor/model/AbstractNodeModel';

import { CodeBlockStorage } from './storage';

// == View ========================================================================
export class CodeBlockModel extends AbstractNodeModel<CodeBlockNodeType, CodeBlockStorage> {
  // No need to implement anything here.
}
