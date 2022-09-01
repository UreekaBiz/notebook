import { AttributeType } from '../attribute';
import { isCodeBlockJSONNode } from '../extension/codeBlock';
import { HeadingLevel, isHeadingJSONNode } from '../extension/heading';
import { JSONNode, NodeIdentifier, NodeName } from '../node';

// FIXME: Find a better approach to shared this with the notebookEditor itself.
// ********************************************************************************
// == Constants ===================================================================
export const codeBlockLevel = Number.MAX_SAFE_INTEGER;

// == Type ========================================================================
type LevelValue = { level: number; value: number; };
export type VisualId = string/*alias*/;
export type VisualIdMap = Record<NodeIdentifier, VisualId>;
export type CodeBlockRendererState = {
  visualIds: VisualIdMap;
  stack: LevelValue[];
}

export type RendererState = {
  [NodeName.CODEBLOCK]: CodeBlockRendererState;
}

// == State =======================================================================
// performs a depth-first search of all nodes in order to compute the visual state
// for all the Nodes present in the document.
export const computeState = (doc: JSONNode): RendererState => {
  const codeBlockState: CodeBlockRendererState = {
    visualIds: {},
    stack: [],
  };
  const rendererState: RendererState = {
    [NodeName.CODEBLOCK]: codeBlockState,
  };
  // determine the headings before the specified code block using a depth-first search
  // REF: https://en.wikipedia.org/wiki/Depth-first_search
  const incorporateNode = (node: JSONNode): boolean/*false when done traversing*/ => {
    if(isCodeBlockJSONNode(node) && node.attrs) {
      updateStack(codeBlockLevel/*by definition*/, codeBlockState);

      // compute the id as a string
      const visualId = node.attrs[AttributeType.Id];
      if(!visualId) return false/*nothing to do*/;

      codeBlockState.visualIds[visualId] = codeBlockState.stack.map(({ value }) => value).join('.');
    } else if(isHeadingJSONNode(node)) {
      const attrs = node.attrs ?? {}/*default*/;
      const level = attrs[AttributeType.Level] ?? HeadingLevel.One /*default*/;
      if(!level) return false/*nothing to do*/;

      updateStack(level, codeBlockState);
    } /* else -- not a heading or code block node */

    if(!node.content || node.content.length < 1) return true/*keep searching (but nothing else to do)*/;

    // traverse all of its children
    for(let i=0; i<node.content.length; i++) {
      if(!incorporateNode(node.content[i])) return false/*done traversing*/;
    }

    return true/*nothing found but keep traversing*/;
  };

  // traverse every node on the document in a DFS order to generate the visualId
  incorporateNode(doc);
  return rendererState;
};

// FIXME: Find a home for this function
// ********************************************************************************
// the visual identifier for a Code Block is based on the Headings that are before
// it. Its goal is to provide a research paper-like numbering (e.g. 2.5.1) of
// Code Blocks to simplify referring to them. The visual identifier is guaranteed
// to be unique within a Notebook. The visual identifier changes as the Headings
// before a Code Block are changed.
//
// Normal cases:
// 1. 1.1.1.1: H1, H2, H3, C
// 2. 2.1.1.1: H1, X, H1, H2, H3, C (X != H1)
// 3. 2.2.1.1: H1, X, H1, H2, Y, H2, H3, C (X != H1, Y != H1 || H2)
// 4. 2.2.2.1: H1, X, H1, H2, Y, H2, H3, H3, C (X != H1, Y != H1 || H2)
// 5. 2.2.2.2: H1, X, H1, H2, Y, H2, H3, H3, C, C (X != H1, Y != H1 || H2)
//
// Gap Cases:
//   The desire is to not 'penalize' the author because they didn't use headings.
//   Specifically, the goal is to not include '0's as placeholders. Unfortunately
//   this causes degenerate cases (i.e. #2, #3, #5 and #4, #6, #7).
// 1. (0.0.0.1) 1: C
// 2. (0.0.1.1) 1.1: H3, C
// 3. (0.1.0.1) 1.1: H2, C
// 4. (0.1.1.1) 1.1.1: H2, H3, C
// 5. (1.0.0.1) 1.1: H1, C
// 6. (1.0.1.1) 1.1.1: H1, H3, C
// 7. (1.1.0.1) 1.1.1: H1, H2, C
//
// The approach is stack-based. A tuple of level-value is pushed on the stack.
// Code Blocks are level max-int to allow for arbitrary number of levels.
//
// H1 => 1 (nothing seen, push 1:1)
// C  => 1.1 (>1, push ∞:1)
// H1 => 1 (<∞, pop (=1), increment)
// C  => 1.2 (>1, push ∞:1)
//
// H1 => 1 (nothing seen, push 1:1)
// H1 => 2 (=1, increment)
// C  => 2.1 (>1, push ∞:1)
// C  => 2.2 (=∞, increment)
// H1 => 3 (<∞, pop (=1), increment)
//
// H1 => 1 (nothing seen, push 1:1)
// H2 => 1.1 (>1, push 2:1)
// H2 => 1.2 (=2, increment)
// C  => 1.2.1 (>2, push ∞:1)
// H2 => 1.3 (<∞, pop (=2), increment)
// C  => 1.3.1 (>2, push ∞:1)
// H1 => 2 (<∞, pop (<2), pop(=1), increment)
// C  => 2.1 (>2, push ∞:1)
//
// H1 => 1 (nothing seen, push 1:1)
// H3 => 1.1 (>1, push 3:1)
// C  => 1.1.1 (>3, push ∞:1)
// H2 => 1.2 (<∞, pop (<3), pop(>1), re-level, increment)
// C  => 1.2.1 (>2, push ∞:1)
//
// Note: this case can (and should?) be debated
// H2 => 1 (nothing seen, push 2:1)
// C  => 1.1 (>2, push ∞:1)
// C  => 1.2 (=∞, increment)
// H3 => 1.1 (<∞, pop (>2), push 3:1)
// C  => 1.1.1 (>3, push ∞:1)
// C  => 1.1.2 (=∞, increment)
// NOTE: levels are assumed to be integers with numerically smaller values
//       representing higher levels
// NOTE: levels on the stack will always be in increasing order by design
export const updateStack = (level: number, state: CodeBlockRendererState) => {
  const { stack } = state;
  if(stack.length < 1) {
    stack.push({ level, value: 1 });
  } else { /*stack has level-values on it*/
    // peek at the level at the top of the stack and compare the specified level:
    // - if specified greater than top: push new tuple
    //   (ex: H1, C)
    // - if specified equal to top: increment value
    //   (ex: C, C)
    // - if specified less than top: pop and peek again (leaving 1 tuple on stack)
    //   (ex: see examples below)
    const peekTuple = stack[stack.length - 1]/*for convenience*/;
    if(level > peekTuple.level) stack.push({ level, value: 1 });
    else if(level === peekTuple.level) peekTuple.value++;
    else { /*level < peekTuple.level*/
      // pop while specified level less than the top of the stack
      let lastPop: LevelValue = stack.pop()!;
      while((stack.length > 0) && (level < stack[stack.length - 1].level)) lastPop = stack.pop()!;

      // NOTE: this nested 'if' block *could* be logically collapsed. It is explicit
      //       for debugging and sanity reasons.
      if(stack.length > 0) {
        // there are still tuples on the stack which means that the specified level
        // is between the level on the top of the stack and the one last popped:
        // - if specified greater than new top: push new tuple but account for last popped
        //   (if last popped was a Code Block then treat as new otherwise increment)
        //   (ex: H1, H3, C, H2, C)
        // - if specified equal to new top: increment value
        //   (ex: H1, H2, C, H2, C)
        // - if specified less than new top: cannot occur (since would have been popped)
        const newPeekTuple = stack[stack.length - 1]/*for convenience*/;
        if(level > newPeekTuple.level) stack.push({ level, value: (lastPop.level === codeBlockLevel) ? 1 : lastPop.value + 1/*increment*/ });
        else if(level === newPeekTuple.level) newPeekTuple.value++;
        else /*level < newPeekTuple.level*/ throw new Error(`Visual identifier stack should have been popped (${level} < ${newPeekTuple.level}).`);
      } else { /*stack empty*/
        // the stack is now empty. Use the last popped tuple:
        // - if specified greater than last popped: cannot occur since wouldn't have been popped
        // - if specified equal to last popped: cannot occur since wouldn't have been popped
        // - if specified less than last popped: re-level, increment and push
        //   (ex: H3, C, H1, C)
        if(level > lastPop.level) throw new Error(`Visual identifier stack out of order (${level} > ${lastPop.level}).`);
        else if(level === lastPop.level) throw new Error(`Visual identifier stack out of order (${level} = ${lastPop.level}).`);
        else { /*level < lastPop.level*/
          lastPop.level = level/*re-level*/;
          lastPop.value++;
          stack.push(lastPop);
        }
      }
    }
  }
};
