# MarkHolder

This extension adds support for MarkHolder nodes, which get inserted at the
start of their parent Block Node whenever its Content gets deleted, but they
themselves are not. This is to deal with the fact that Marks must be active
even if their parent Node has no Content. Whenever the User types or pastes
something into a place that has a MarkHolder Node, the typed or pasted Text
will receive the Marks stored in the MarkHolder, and the MarkHolder will
be removed.

Things to be taken into account when developing a Node with functionality
similar to this are:
1. What happens if the User Pastes Content?
2. How should the Node be parsed?
3. What happens if the Selection is set behind the Node?
4. When should and should not ProseMirror handle an event (e.g. KeyDown
or Paste). How should Arrow interactions be handled?
5. Ensure all other functionality (e.g. Marks being active in the Toolbar)
is taken into account
6. What happens if Nodes of this type (that aren't meant to be editable
by the User) are pasted in wrong positions? (i.e. how to prevent this
from ever happening)
7. If the Node has the same DOM representation as other Nodes, then the
priority for its ParseHTML behavior must be taken into account
8. Should operations like Backspace, Cut, Copy, Paste receive any special handling?
