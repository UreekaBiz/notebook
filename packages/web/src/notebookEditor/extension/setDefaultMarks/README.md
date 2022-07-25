# SetDefaultMarks

This extension ensures that the nodes specified in it receive a custom set of
initial, default marks on creation (specifically, after the first time their
text content becomes something other than the empty string '').

In order to work, this extension requires that the specified nodes include an
'initialMarksSet' boolean attribute, which gets checked to 'true' after the
initial marks have been applied once. Afterwards the user an remove the marks
if required.

It has been extracted into an extension to prevent plugin key duplication
(that is, adding it individually as a PM plugin for each node that requires
custom marks). This not only prevents plugin key duplication but ensures
the plugin only runs once each time a new final editor /editor view state is
being computed.

