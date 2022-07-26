import { Node, InputRule } from '@tiptap/core';

import { createBoldMark, createMarkHolderNode, getBlockNodeRange, generateNodeId, getHeadingLevelFromTag, getNodeOutputSpec, stringifyMarksArray, AttributeType, HeadingLevel, HeadingNodeSpec, SetAttributeType } from '@ureeka-notebook/web-service';

import { shortcutCommandWrapper } from 'notebookEditor/command/util';
import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoStorage } from 'notebookEditor/model/type';

import { setHeadingCommand } from './command';
import { headingPlugin } from './plugin';
import { HeadingOptions } from './type';

// ********************************************************************************
// == Node ========================================================================
export const Heading = Node.create<HeadingOptions, NoStorage>({
  ...HeadingNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
      // NOTE: not using uniqueIdParsingBehavior since Headings have no storage
      [AttributeType.Id]: { parseHTML: () => generateNodeId() },

      [AttributeType.Level]: { default: HeadingLevel.One, parseHTML: element => getHeadingLevelFromTag(element.tagName) },

      [AttributeType.BackgroundColor]: setAttributeParsingBehavior(AttributeType.BackgroundColor, SetAttributeType.STYLE),
      [AttributeType.Color]: setAttributeParsingBehavior(AttributeType.Color, SetAttributeType.STYLE),
      [AttributeType.FontSize]: setAttributeParsingBehavior(AttributeType.FontSize, SetAttributeType.STYLE),

      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, SetAttributeType.STYLE),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, SetAttributeType.STYLE),
      [AttributeType.PaddingLeft]: setAttributeParsingBehavior(AttributeType.PaddingLeft, SetAttributeType.STYLE),
      [AttributeType.PaddingRight]: setAttributeParsingBehavior(AttributeType.PaddingRight, SetAttributeType.STYLE),

      [AttributeType.MarginTop]: setAttributeParsingBehavior(AttributeType.MarginTop, SetAttributeType.STYLE),
      [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STYLE),
      [AttributeType.MarginBottom]: setAttributeParsingBehavior(AttributeType.MarginBottom, SetAttributeType.STYLE),
      [AttributeType.MarginRight]: setAttributeParsingBehavior(AttributeType.MarginRight, SetAttributeType.STYLE),

      [AttributeType.TextAlign]: setAttributeParsingBehavior(AttributeType.TextAlign, SetAttributeType.STYLE),
    };
  },
  addOptions() {
    return {
      levels: [HeadingLevel.One, HeadingLevel.Two, HeadingLevel.Three, HeadingLevel.Four, HeadingLevel.Five, HeadingLevel.Six],
      HTMLAttributes: {/*currently nothing*/},
    };
  },

  // -- Command -------------------------------------------------------------------
  addKeyboardShortcuts() {
    return this.options.levels.reduce((items, level) => ({
      ...items, ...{ [`Mod-Alt-${level}`]: () => shortcutCommandWrapper(this.editor, setHeadingCommand({ [AttributeType.Level]: level })) },
    }), {});
  },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [headingPlugin()]; },

  // -- Input ---------------------------------------------------------------------
  // Create a Heading Node if the user types '#' a certain amount of times and
  // a space or an enter. The amount of times '#' was typed will be the level
  // of the Heading, if it is a valid HeadingLevel. The created Heading Node
  // will contain a MarkHolder with the Bold Mark set by default
  addInputRules() {
    return this.options.levels.map(level => {
      return new InputRule({
        find: new RegExp(`^(#{1,${level}})\\s$`),
        handler: ({ state, range }) => {
          const startPos = state.doc.resolve(range.from);

          if(!startPos.node(-1/*top level*/).canReplaceWith(startPos.index(-1/*top level*/), startPos.indexAfter(-1/*top level*/), this.type)) {
            return null/*the resulting Node Content is not valid, do nothing*/;
          } /* else -- the resulting Node Content is valid, set Heading Block Type */

          const { tr } = state;
          const boldMark = createBoldMark(state.schema);
          const storedMarks = stringifyMarksArray([boldMark]);

          tr.delete(range.from, range.to)
            .setBlockType(range.from, range.from, this.type, { [AttributeType.Id]: generateNodeId(), [AttributeType.Level]: level });

            if(tr.selection.$from.parent.content.childCount === 0/*empty parent*/) {
              // add MarkHolder
              tr.insert(tr.selection.anchor, createMarkHolderNode(state.schema, { storedMarks } ));
            } else {
              // apply default Bold Mark
              const { from, to } = getBlockNodeRange(tr.selection);
              tr.addMark(from, to, boldMark);
          }

          return/*nothing left to do*/;
        },
      });
    });
  },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return this.options.levels.map((level: HeadingLevel) => ({ tag: `h${level}` })); },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});
