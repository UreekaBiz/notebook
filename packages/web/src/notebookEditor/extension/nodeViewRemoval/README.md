# NodeViewRemoval

REF: https://discuss.prosemirror.net/t/getpos-in-nodeview-still-returns-old-value-when-new-node-is-inserted/2533/4

NodeViews that are implemented via AbstractNodeViews) have,
by convention, a storage that stores every NodeView instance for ease of
access to their view elements. These NodeViews can have logic in their
constructors and on the destroy call

When implementing them one has to take into account the following details

1. Whenever the node attributes of the node that the NodeView represents
are changed through a transaction whose origin is an appendedTransaction,
(e.g. through a setNodeMarkup call), the node gets replaced and thus a new
NodeView is created (since transactions from appendedTransactions do not
trigger the update method of the NodeView, but they do trigger the
destroy method).

2. The constructor of a new NodeView gets called before the destroy method
of the previous version of the node

3. While the View DOM Tree is being reconstructed, all other NodeViews get
their getPos() method set to return 0. Once the view has been reconstructed,
their getPos() works correctly. This makes its usage unreliable during
constructor or destroy calls however.

For these reasons, handling which nodes to remove from their respective
NodeViewStorage on NodeView removal has been delegated to this
extension, which observes the modified ranges on each transaction and modifies
the corresponding nodeViewStorages
