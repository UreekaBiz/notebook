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

| Keyboard Shortcut                                   | Description                                                    |
| --------------------------------------------------- | -------------------------------------------------------------- |
| <kbd>cmd</kbd><kbd>B</kbd>                          | Toggle the **bold** Mark                                       |
| <kbd>cmd</kbd><kbd>Shift</kbd><kbd>X</kbd>          | Toggle the ~~strikethrough~~ Mark                              |
| <kbd>cmd</kbd><kbd>A</kbd>                          | Select all the text in the editor (when focused)               |
| <kbd>cmd</kbd><kbd>C</kbd>                          | Copy the selected text or nodes to the clipboard               |
| <kbd>cmd</kbd><kbd>V</kbd>                          | Paste the selected text or nodes to the editor                 |
| <kbd>cmd</kbd><kbd>X</kbd>                          | Cut the selected text or nodes from the editor                 |
| <kbd>cmd</kbd><kbd>Shift</kbd><kbd>Arrow Keys</kbd> | Select the corresponding text or nodes with the arrow keys     |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>0</kbd>         | Toggle a Paragraph Node                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>1</kbd>         | Toggle a Heading1 Node                                         |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>2</kbd>         | Toggle a Heading2 Node                                         |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>3</kbd>         | Toggle a Heading3 Node                                         |
| <kbd>ctrl</kbd><kbd>option</kbd><kbd>,</kbd>        | Preview Published Notebook                                     |
| <kbd>ctrl</kbd><kbd>option</kbd><kbd>,</kbd>        | Toggle Development Mode                                        |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>,</kbd>         | Focus the Notebook Editor                                      |
| <kbd>cmd</kbd><kbd>option</kbd><kbd>.</kbd>         | Focus the first available ToolItem in the toolbar              |

## Parse Rules
This is the list of parse rules that are implemented in the editor

| Rule                                                             | Description                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Wrap text in between double * characters                         | Toggle the **bold** Mark for the corresponding text            |
| Wrap text in between double _ characters                         | Toggle the **bold** Mark for the corresponding text            |
| Wrap text in between double ~ characters                         | Toggle the ~~strikethrough~~ Mark for the corresponding text   |
| Type between 1 and 3 '#' characters at the start of a new line   | Toggle a Heading Node with the corresponding level             |
