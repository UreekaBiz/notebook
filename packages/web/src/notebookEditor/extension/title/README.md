# Title

REF: https://discuss.prosemirror.net/t/could-topnode-get-a-nodeview-or-at-least-a-custom-ignoremutation/1632
REF: https://github.com/ProseMirror/prosemirror-view/pull/40

This extension implements a Node that holds the title of the document.

Note that even though one may be tempted to think of this Node as the topNode
of the document, PM does not work this way. The Document itself is always the
topNode, and it is treated differently than other Nodes (e.g. it cannot have a
NodeView, (SEE: the refs above)). Instead of that, the content of the Document
Node must be modified so that it always includes the Title and, afterwards, any
other content (SEE: Document.ts).

Since the Title cannot be removed, as it must always be present in the Document,
custom backspace behavior is implemented for this Node (since, the fact that it
must be present in the Document does not mean that the User can't delete it, thus
triggering another titleView creation by PM. The backspace keyboard shortcut
implementation prevents this from happening).

The Title Node has placeholder functionality that allows it to display text
even when empty (like an HTML input tag). This placeholder inherits the style of
the currently active Marks for the Paragraph inside the Title.

In order to maintain the placeholder style in sync with the Marks that are applied
to the Title, and have default Marks on creation of the Document, a JS NodeView is
leveraged, as well as the Title extension Storage. A single titleView is used and
maintained throughout the lifecycle of the Document. A Plugin ensures that the
default set of desired Marks is applied on creation and maintained afterwards
through the Marks that are carried in the storedMarks Set of the Transaction (this
is implemented by an onTransaction implementation).

Since the User cannot 'copy' a Title Node, the renderHTML behavior of the Title is
such that copying the content of the Title only copies the text contained within it.