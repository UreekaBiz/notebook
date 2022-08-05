import { Mark } from '@tiptap/core';

import { getMarkOutputSpec, MarkName, ReplacedTextMarkMarkSpec, DATA_MARK_TYPE } from '@ureeka-notebook/web-service';

import { NoOptions, NoStorage } from 'notebookEditor/model/type';

import { ReplacedTextMarkPlugin } from './plugin';

// ********************************************************************************
export const ReplacedTextMark = Mark.create<NoOptions, NoStorage>({
  ...ReplacedTextMarkMarkSpec,

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [ReplacedTextMarkPlugin()]; },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return [{ tag: `span[${DATA_MARK_TYPE}="${MarkName.REPLACED_TEXT_MARK}"]` }]; },
  renderHTML({ mark, HTMLAttributes }) { return getMarkOutputSpec(mark, HTMLAttributes); },
});
