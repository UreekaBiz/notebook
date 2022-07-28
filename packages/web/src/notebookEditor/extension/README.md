# Extension

Extensions allow extra functionality to be added to the Editor.
These are the general steps to follow when creating a new Extension
that adds a Node, Mark, or just new functionality.

1. Create a lowercase file for the extension in `src/common/notebookEditor/`
2. Define the new Node or Mark AttributeSpec
3. Define any required constants for the new Node, Mark or Extension
4. Use the AttributeSpec to create the type for its Attributes
5. Define the new Node or Mark Spec
6. Define the new Node or Mark RendererSpec
7. Define the new Node or Mark Type
8. Define the new Node or Mark Type Guard
9. Define the new Node or Mark `JSONType`
10. Define the new Node or Mark `isJSONType` Type Guard
11. Define utility functions for the new Node or Mark, such as
`createDefaultAttributes()`, or as many as required
12. Create a lowercase folder for the extension in `src/notebookEditor/extension`
13. Create a file for the new extension (e.g. `HeadingNode.ts`)
14. Use the Spec from common to define the new Node or Mark Spec
15. If needed, define the priority for the new Node, Mark or Extension
16. Add the new Node or Mark Attributes. They must match their
`src/common/notebookEditor` counterpart
17. Add the new Node or Mark's Options, Commands, Keyboard Shortcuts,
Storage, Plugins, Input and Paste Rules, as well as its ParseHTML and RenderHTML
handlers as needed
18. If needed, define the priority for the new Node or Mark Input and Parse Rules
18. Update the README.md file in `src/notebookEditor/README.md` with the Keyboard
Shortcuts and Parse Rules that were added for the new Node, Mark or Extension
19. Register the new Node, Mark or Extension in `src/notebookEditor/type`
20. Ensure that the new Node, Mark or Extension functionality works correctly
This includes, but is not limited to, checking the following things:
- The Editor-Render behavior works as expected
- The Preview-Render behavior works as expected
- The interactions between the new Node, Mark or Extension functionality and the
history work as expected
- Copying, Pasting, Cutting and Deleting the new Node or Mark works as expected
- Input Rules and Parse Rules work as expected
- Modifying the new Node or Mark attributes does not incorrectly modify
the cursor position of the Editor's selection
- The selection is maintained correctly throughout any interaction
with the new Node, Mark or Extension
- All ToolItems associated with the new Node, Mark or Extension work as expected
