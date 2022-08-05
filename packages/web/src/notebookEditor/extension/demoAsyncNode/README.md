# DemoAsyncNode

This extension adds support for the creation of DemoAsyncNodes, inline nodes
with text content that listen to codeBlocks (SEE: CodeBlock.ts). As such, whether
or not they are considered to be dirty since their last execution depends on their
codeBlockReferences and codeBlockHashes (SEE: CodeBlockAsyncNode.ts)

Once the DemoAsyncNode has been executed once, it can't ever go back to being in a
non executed state.

DemoAsyncNodes create a promise that resolves after a specified period of time.
This promise can either resolve successfully or with an error. The DemoAsyncNode's
view reflects this.
