# NotebookEditor

The NotebookEditor encompasses all the needed parts to ensure that the user is
able to use the editor. The NotebookEditor uses several components that make it up.

Its state is accessed through the NotebookProvider, which uses the NotebookContext.

Functionality is added to the editor through extensions, which can implement custom
behavior, a node or a mark.

Whenever AbstractNodeViews are used, they're split up into an AbstractNodeController,
an AbstractNodeModel and an AbstractNodeView. They can either define their own
options or choose not to use any, and use either NoStorage, a NodeViewStorage,
a DialogStorage, or their own custom storage.

The NotebookEditor has a theme, which affects the default style attributes of the
nodes and marks inside of it. There can only be one theme active at a time.

The user interacts with the NotebookEditor through a toolbar. A node or mark can
define its own Toolbar to provide node or mark specific interaction to the user
with nodes or marks of the corresponding type, through ToolItems.
These are mostly meant to be shown only when the user as the specific node
currently selected, or the corresponding mark is active, though the behavior can
be customized and be node or mark specific.

## Keyboard Shortcuts
This is the list of keyboard shortcuts that is built into the Notebook Editor.

| Keyboard Shortcut                                           | Description                                                    |
| ----------------------------------------------------------- | -------------------------------------------------------------- |
| <kbd>cmd</kbd><kbd>B</kbd>                                  | Toggle the **bold** Mark                                       |
| <kbd>cmd</kbd><kbd>I</kbd>                                  | Toggle the <em>italic<em> Mark                                 |
| <kbd>cmd</kbd><kbd>U</kbd>                                  | Toggle the <u>underline<u> Mark                                |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>X</kbd>                      | Toggle the ~~strikethrough~~ Mark                              |
| <kbd>cmd</kbd><kbd>E</kbd>                                  | Toggle the `code` Mark                                         |
| <kbd>cmd</kbd><kbd>.</kbd>                                  | Toggle the <sup>superscript<sup> Mark                          |
| <kbd>cmd</kbd><kbd>,</kbd>                                  | Toggle the <sub>subscript<sub> Mark                            |
| <kbd>cmd</kbd><kbd>K</kbd>                                  | Insert a Link                                                  |
| <kbd>cmd</kbd><kbd>A</kbd>                                  | Select all the text in the editor (when focused)               |
| <kbd>cmd</kbd><kbd>C</kbd>                                  | Copy the selected text or nodes to the clipboard               |
| <kbd>cmd</kbd><kbd>V</kbd>                                  | Paste the selected text or nodes to the editor                 |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>V</kbd>                      | Paste the selected text or nodes to the editor as plain text   |
| <kbd>cmd</kbd><kbd>X</kbd>                                  | Cut the selected text or nodes from the editor                 |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>Arrow Keys</kbd>             | Select the corresponding text or nodes with the arrow keys     |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>0</kbd>                 | Toggle a Paragraph Node                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>1</kbd>                 | Toggle a Heading 1 Node                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>2</kbd>                 | Toggle a Heading 2 Node                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>3</kbd>                 | Toggle a Heading 3 Node                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>4</kbd>                 | Toggle a Heading 4 Node                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>5</kbd>                 | Toggle a Heading 5 Node                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>6</kbd>                 | Toggle a Heading 6 Node                                        |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>B</kbd>                      | Insert a Nested View Block Node                                |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>Option</kbd><kbd>I</kbd>     | Insert an Image Node                                           |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>C</kbd>                      | Toggle a CodeBlock Node                                        |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>Option</kbd><kbd>C</kbd>     | Insert a CodeBlockReference Node                               |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>D</kbd>                      | Insert and select a DemoAsyncNode                              |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>Option</kbd><kbd>D</kbd>     | Insert a Demo2AsyncNode and place cursor inside                |
| <kbd>cmd</kbd><kbd>⇧</kbd><kbd>E</kbd>                      | Insert an Editable Inline Node with Content                    |
| <kbd>⇧</kbd><kbd>enter</kbd>                                | (When inside a CodeBlock Node), insert a Paragraph Node below  |
| <kbd>ctrl</kbd><kbd>option</kbd><kbd>,</kbd>                | Preview Published Notebook                                     |
| <kbd>ctrl</kbd><kbd>option</kbd><kbd>,</kbd>                | Toggle Development Mode                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>,</kbd>                 | Focus the Notebook Editor                                      |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>.</kbd>                 | Focus the first available ToolItem in the toolbar              |

## Parse Rules
This is the list of parse rules that are implemented in the editor

| Rule                                                             | Description                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Wrap text in between double * characters                         | Toggle the **bold** Mark for the corresponding text            |
| Wrap text in between double _ characters                         | Toggle the **bold** Mark for the corresponding text            |
| Wrap text in between double ~ characters                         | Toggle the ~~strikethrough~~ Mark for the corresponding text   |
| Type between 1 and 3 '#' characters at the start of a new line   | Toggle a Heading Node with the corresponding level             |

# Commands
REF: https://prosemirror.net/docs/guide/#commands

In ProseMirror, Commands are functions that take an Editor State and a Dispatch
function and return a boolean. To be able to query whether a command is applicable
for a given state without executing it, their Dispatch argument is optional.
(SEE: REF above)

That is, in ProseMirror, Commands only return true without doing anything
when they are applicable but no Dispatch argument is given. If the Dispatch
argument is given, they also dispatch the Transaction.

REF: https://github.com/ueberdosis/tiptap/blob/main/packages/core/src/CommandManager.ts#L51
In TipTap, the command() method used by ChainedCommands gets passed, through the
CommandProps, a Dispatch function. This function is undefined whenever the call
to the Command is being done after a can() command call. Otherwise, the Dispatch
function is defined.
(SEE: REF above)

A similar approach to that of ProseMirror should be followed whenever using the
TipTap command. That is, check if the Dispatch function is defined,
perform the action and return accordingly, taking into account that if Dispatch
is undefined, then that means that a can() command has been called before.

Thus, the Dispatch function in TipTap's command() method only has a
semantic meaning relating to whether or not a can() was used previously.
It will always end up passing the transaction to PM and thus be dispatched, which
means that any changes to the Transaction should be made within the body of the
if(dispatch) {/**/} block. In order to be consistent with the way ProseMirror uses
commands, however, commands do dispatch(tr) at their end (as if they were
ProseMirror commands)
