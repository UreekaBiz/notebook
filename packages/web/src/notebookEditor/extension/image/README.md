# Image

A node whose content is an <img> tag, which displays an image.
Its src, title, alt, width and height attributes can be modified through the
Toolbar. The width and height can be expressed in several units of measure.

The image can be added by prompting the User for the image URL.

The image can be added through the Ctrl + Option + I or Cmd + Option + I
shortcuts. Since these shortcuts mix Editor functionality with UI functionality
(as the image's URL must be given through a dialog), communication is done through
the Image Storage, and the shortcuts are listened-for in React.
(SEE: EditorUserInteractions.tsx)
