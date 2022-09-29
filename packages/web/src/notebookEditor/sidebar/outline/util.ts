import { Editor } from '@tiptap/core';

import { isHeadingNode, isType, AttributeType, HeadingLevel, HeadingNodeType, NodeChange } from '@ureeka-notebook/web-service';

import { Outline, OutlineItem } from './type';

// ********************************************************************************
// an Outline is the list of Headings present in the Document ordered in a
// hierarchical order. The representation is a flat list of OutlineItems that has an
// indentation based its Heading Level with respect to the rest of the Headings.
//
// The indentation is a number that goes from 0 to the amount of  different Heading
// Levels present in the document. This is used to render the Outline in a tree-like
// structure even if the Heading levels are not consecutive.
//
// Examples
// levels: [1, 2, 1, 2, 3]
// indentations: [0, 1, 0, 1, 2]
//
// levels: [2, 3, 1, 3, 4, 1]
// indentations: [1, 2, 0, 2, 3, 0]
//
// levels: [2, 3, 4, 1, 2]
// indentations: [1, 2, 3, 0, 1]
//
// levels: [5, 1, 2]
// indentations: [2, 0, 1]

// creates an Outline from the current state of the Editor. Since creating and
// Outline from scratch is a rather expensive operation (it requires iterating over
// all the nodes in the document) it is recommended to use the updateOutline method.
export const createOutline = (editor: Editor): Outline => {
// console.log('Computing full Outline.');
  const { state } = editor,
        { doc } = state;

  // get all the headings and their levels present in the document
  const levels = new Set<HeadingLevel>();
  const headings: HeadingNodeType[] = [];
  doc.descendants((node) => {
    if(!isHeadingNode(node)) return/*nothing to do*/;

    headings.push(node);

    // only add level if present
    const level = node.attrs[AttributeType.Level];
    if(level) levels.add(level);
  });

  // sort the present levels in increasing order.
  const sortedLevels = Array.from(levels).sort((a, b) => a - b);
  // creates a map from the level to its indentation
  const indentations = new Map<HeadingLevel, number>();
  sortedLevels.map((level, i) => indentations.set(level, i));

  // if no level present use the max value (or 0 if no levels present)
  const defaultIndentation = Math.max(0, indentations.size - 1);

  const outline = headings.map<OutlineItem>((heading) => {
    const level = heading.attrs[AttributeType.Level];

    const indentation = level ? indentations.get(level) ?? defaultIndentation : defaultIndentation;
    const id = heading.attrs[AttributeType.Id];
    return isType<OutlineItem>({
      id,
      label: heading.textContent,
      level,
      indentation,
    });
  });


  return outline;
};

// updates an existing Outline with the changes that happened in the Editor. This
// method is much more efficient than creating an Outline from scratch.
// NOTE: if the updates get a disruptive change (e.g. a Heading is removed, added or
//       the level changed) the outline is recomputed from scratch.
export const updateOutline = (editor: Editor, outline: Outline, changes: NodeChange<HeadingNodeType>[]): Outline => {
// console.log('Updating Outline.');
  let newOutline = [...outline];
  let recreate = false/*initially by contract*/;
  for(const change of changes) {
    if(change.removed) {
      recreate = true;
      break/*stop iterating*/;
    } /* else -- Heading is not removed */

    const index = newOutline.findIndex((item) => item.id === change.node.attrs[AttributeType.Id]);

    // Heading was not present
    if(index === -1) { // FIXME: index < 0
      recreate = true;
      break/*stop iterating*/;
    } /* else -- Heading was present */

    const outlineItem = outline[index];
    const level = change.node.attrs[AttributeType.Level];
    if(level !== outlineItem.level) {
      recreate = true;
      break/*stop iterating*/;
    } /* else -- level is the same */

    // update the OutlineItem
    newOutline[index] = {
      ...outlineItem,
      label: change.node.textContent,
    };
  }

  // a Heading was removed or added, recompute the Outline from scratch
  if(recreate) return createOutline(editor)/*nothing else to do*/;

  return newOutline;
};
