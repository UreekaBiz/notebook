# TaskList

This extension adds support for task lists to the editor. They are rendered as
'ul' HTML tags with specific listItems. Typing '[ ]' or '[x]' at the start of
a new line,  followed by an enter or a space will create a TaskList node. These
nodes can also be created through the Ctrl/CMD + ⇧ + 9 keyboard shortcut.

In order for TaskList nodes to work, the TaskListItem extension must be
registered in the editor (SEE: TaskListItem.ts)
