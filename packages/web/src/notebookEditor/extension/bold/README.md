# Bold

Renders text in **bold**. If the editor receives 'strong' or 'b' HTML tags, or text with inline style attributes setting the font-weight CSS rule in the editor's initial content, they will all be rendered accordingly. Typing text between two asterisks (**) or two underlines (__) will also
make the bold mark be applied to the text.

A custom implementation is being used to have control over the RegEx expressions and parsing of the tags.