# SetDefaultMarks

This extension ensures that the Nodes specified in it receive a custom set of
initial, default Marks on creation (specifically, after the first time their
text content becomes something other than the empty string '').

In order to work, this extension requires that the specified Nodes include an
'initialMarksSet' boolean attribute, which gets checked to 'true' after the
initial Marks have been applied once. Afterwards the User can remove the Marks
if required.

It has been extracted into an Extension to prevent plugin key duplication
(that is, adding it individually as a PM plugin for each node that requires
custom Marks). This not only prevents plugin key duplication but ensures
the plugin only runs once each time a new final Editor / Editor view state is
being computed.
