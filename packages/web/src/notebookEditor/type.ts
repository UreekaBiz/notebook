import { EDITOR_CLASS_NAME, EDITOR_EDITABLE_CLASS_NAME } from 'core/theme';
import { AsyncNode } from 'notebookEditor/extension/asyncNode/AsyncNode';
import { Bold } from 'notebookEditor/extension/bold/Bold';
import { BulletList } from 'notebookEditor/extension/list/bulletList/BulletList';
import { Code } from 'notebookEditor/extension/code/Code';
import { CodeBlock } from 'notebookEditor/extension/codeblock/CodeBlock';
import { CodeBlockReference } from 'notebookEditor/extension/codeBlockReference/CodeBlockReference';
import { CodeBlockAsyncNode } from 'notebookEditor/extension/codeBlockAsyncNode/CodeBlockAsyncNode';
import { Demo2AsyncNode } from 'notebookEditor/extension/demo2AsyncNode/Demo2AsyncNode';
import { DemoAsyncNode } from 'notebookEditor/extension/demoAsyncNode/DemoAsyncNode';
import { Document } from 'notebookEditor/extension/document/Document';
import { DropCursor } from 'notebookEditor/extension/dropCursor/DropCursor';
import { EmojiSuggestion } from 'notebookEditor/extension/emojiSuggestion/EmojiSuggestion';
import { GapCursor } from 'notebookEditor/extension/gapcursor/GapCursor';
import { Heading } from 'notebookEditor/extension/heading/Heading';
import { Highlight } from 'notebookEditor/extension/highlight/Highlight';
import { History } from 'notebookEditor/extension/history/History';
import { Image } from 'notebookEditor/extension/image/Image';
import { InputRule } from 'notebookEditor/extension/inputRule/InputRule';
import { InlineNodeWithContent } from 'notebookEditor/extension/inlineNodeWithContent/InlineNodeWithContent';
import { Italic } from 'notebookEditor/extension/italic/Italic';
import { ListItem } from 'notebookEditor/extension/list/listItem/ListItem';
import { ListItemContent } from 'notebookEditor/extension/list/listItemContent/ListItemContent';
import { Link } from 'notebookEditor/extension/link/Link';
import { MarkHolder } from 'notebookEditor/extension/markHolder/MarkHolder';
import { NodeViewRemoval } from 'notebookEditor/extension/nodeViewRemoval/NodeViewRemoval';
import { OrderedList } from 'notebookEditor/extension/list/orderedList/OrderedList';
import { Paragraph } from 'notebookEditor/extension/paragraph/Paragraph';
import { ReplacedTextMark } from 'notebookEditor/extension/replacedTextMark/ReplacedTextMark';
import { Strikethrough } from 'notebookEditor/extension/strikethrough/Strikethrough';
import { SubScript } from 'notebookEditor/extension/subScript/SubScript';
import { SuperScript } from 'notebookEditor/extension/superScript/SuperScript';
import { TaskList } from 'notebookEditor/extension/list/taskList/TaskList';
import { TaskListItem } from 'notebookEditor/extension/list/taskListItem/TaskListItem';
import { Text } from 'notebookEditor/extension/text/Text';
import { TextStyle } from 'notebookEditor/extension/textStyle/TextStyle';
import { Underline } from 'notebookEditor/extension/underline/Underline';

// ********************************************************************************
// defines the structure of the Editor
// SEE: NotebookProvider
export const editorDefinition = {
  // NOTE: when adding or removing Extensions, the Schema must also be updated to
  //       reflect the new changes. It is used to validate the document and perform
  //       operations on the server-side and must be always be in sync
  // SEE: /common/notebookEditor/prosemirror/schema.ts
  extensions: [
    AsyncNode,
    Bold,
    BulletList,
    Code,
    CodeBlock,
    CodeBlockAsyncNode,
    CodeBlockReference,
    Demo2AsyncNode,
    DemoAsyncNode,
    DropCursor,
    EmojiSuggestion,
    Document,
    GapCursor,
    Heading,
    Highlight,
    History,
    Italic,
    Image,
    InlineNodeWithContent,
    InputRule,
    Link,
    ListItem,
    ListItemContent,
    MarkHolder,
    NodeViewRemoval,
    OrderedList,
    Paragraph,
    ReplacedTextMark,
    Strikethrough,
    SubScript,
    SuperScript,
    TaskList,
    TaskListItem,
    Text,
    TextStyle,
    Underline,
  ],
  editorProps: { attributes: { class: `${EDITOR_CLASS_NAME} ${EDITOR_EDITABLE_CLASS_NAME}`/*SEE: /index.css*/ } },

  autofocus: true/*initially has focus*/,
  content: ''/*initially empty*/,
};

// NOTE: the following execution order goes from top-first to bottom-last
// SEE: FeatureDoc, Changes section
//
// Current Schema Execution Order
// SEE: notebookEditor/model/type/ExtensionPriority
// appendedTransaction
// 1. NodeViewRemoval
// 2. SetDefaultMarks
// 3. Paragraph
// 4. all other extensions (in registration order, (SEE: Extension array above))
//
// onTransaction
// 1. NodeViewRemoval
// 2. SetDefaultMarks
// 3. Paragraph
// 4. all other extensions (in registration order, (SEE: Extension array above))
//
// onSelectionUpdate
// 1. NodeViewRemoval
// 2. SetDefaultMarks
// 3. Paragraph
// 4. all other extensions (in registration order, (SEE: Extension array above))
//
// onUpdate
// 1. NodeViewRemoval
// 2. SetDefaultMarks
// 3. Paragraph
// 4. all other extensions (in registration order, (SEE: Extension array above))
