# UniqueNodeId

Allows nodes that specify an 'id' attribute in their spec and get added to the unique node set (see `UniqueNodeId#includedNodes()`) to be uniquely identified across the editor's state.

A custom implementation is being used since neither PM or TipTap expose unique node implementations by default for free, and to customize the desired behavior.
