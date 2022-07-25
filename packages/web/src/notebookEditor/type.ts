import { Bold } from 'notebookEditor/extension/bold/Bold';
import { GapCursor } from 'notebookEditor/extension/gapcursor/GapCursor';
import { Heading } from 'notebookEditor/extension/heading/Heading';
import { Document } from 'notebookEditor/extension/document/Document';
import { Highlight } from 'notebookEditor/extension/highlight/Highlight';
import { History } from 'notebookEditor/extension/history/History';
import { NodeViewRemoval } from 'notebookEditor/extension/nodeViewRemoval/NodeViewRemoval';
import { Paragraph } from 'notebookEditor/extension/paragraph/Paragraph';
import { SetDefaultMarks } from 'notebookEditor/extension/setDefaultMarks/SetDefaultMarks';
import { Style } from 'notebookEditor/extension/style/Style';
import { Text } from 'notebookEditor/extension/text/Text';
import { TextStyle } from 'notebookEditor/extension/textStyle/TextStyle';
import { UniqueNodeId } from 'notebookEditor/extension/uniqueNodeId/UniqueNodeId';

// ********************************************************************************
// defines the structure of the Editor
// SEE: NotebookProvider
export const editorDefinition = {
  // NOTE: when adding or removing extensions, the Schema must be updated to match
  //       the new changes. The Schema is used to validate the document and perform
  //       operations on the server-side and must be always be in sync.
  // SEE: @service-common:/notebookEditor/prosemirror/schema
  extensions: [ Bold, Document, GapCursor, Heading, Highlight, History, NodeViewRemoval, Paragraph, SetDefaultMarks, Style, Text, TextStyle, UniqueNodeId ],
  editorProps: { attributes: { class: 'Editor'/*SEE: /index.css*/ } },

  autofocus: true/*initially has focus*/,
  content: ''/*initially empty*/,
};
