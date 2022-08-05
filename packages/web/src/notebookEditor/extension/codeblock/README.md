# CodeBlock

A CodeBlockNode is a block node that contains editable text inside of it.
It has a VisualID that indicates its position relative to Headings and other CodeBlocks
that are present in the Editor.

The User can get out of a CodeBlock by inserting a new paragraph below it with the Shift + Enter
Keyboard Shortcut when the Editor's selection is inside the CodeBlock.

If the CodeBlock is the first Node on the document, a GapCursor will appear
when the user tries to go above it with the arrow keys. If its the last node in the document,
the GapCursor appears below.

The text content of the CodeBlocks can be used to interact with other nodes, e.g. Async Nodes.