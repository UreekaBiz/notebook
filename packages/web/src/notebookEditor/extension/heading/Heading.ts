import { Node, InputRule } from '@tiptap/core';

import { createBoldMark, createMarkHolderNode, generateNodeId, getHeadingLevelFromTag, getNodeOutputSpec, AttributeType, HeadingLevel, HeadingNodeSpec, SetAttributeType } from '@ureeka-notebook/web-service';

import { setAttributeParsingBehavior } from 'notebookEditor/extension/util/attribute';
import { NoStorage } from 'notebookEditor/model/type';

import { setHeadingCommand, toggleHeadingCommand } from './command';
import { HeadingPlugin } from './plugin';
import { createDefaultHeadingAttributes, HeadingOptions } from './type';

// ********************************************************************************
// == Node ========================================================================
export const Heading = Node.create<HeadingOptions, NoStorage>({
  ...HeadingNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      // Creates a new id for the node when it is created.
      [AttributeType.Id]: { parseHTML: () => generateNodeId() },
      [AttributeType.Level]: { default: HeadingLevel.One, parseHTML: element => getHeadingLevelFromTag(element.tagName) },

      [AttributeType.FontSize]: setAttributeParsingBehavior(AttributeType.FontSize, SetAttributeType.STRING),
      [AttributeType.TextColor]: setAttributeParsingBehavior(AttributeType.TextColor, SetAttributeType.STRING),

      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, SetAttributeType.STRING),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, SetAttributeType.STRING),
      [AttributeType.PaddingLeft]: setAttributeParsingBehavior(AttributeType.PaddingLeft, SetAttributeType.STRING),
      [AttributeType.PaddingRight]: setAttributeParsingBehavior(AttributeType.PaddingRight, SetAttributeType.STRING),

      [AttributeType.MarginTop]: setAttributeParsingBehavior(AttributeType.MarginTop, SetAttributeType.STRING),
      [AttributeType.MarginLeft]: setAttributeParsingBehavior(AttributeType.MarginLeft, SetAttributeType.STRING),
      [AttributeType.MarginBottom]: setAttributeParsingBehavior(AttributeType.MarginBottom, SetAttributeType.STRING),
      [AttributeType.MarginRight]: setAttributeParsingBehavior(AttributeType.MarginRight, SetAttributeType.STRING),
    };
  },
  addOptions() {
    return {
      levels: [HeadingLevel.One, HeadingLevel.Two, HeadingLevel.Three],
      HTMLAttributes: {/*currently nothing*/},
    };
  },

  // -- Command -------------------------------------------------------------------
  addCommands() {
    return {
      setHeading: setHeadingCommand,
      toggleHeading: toggleHeadingCommand,
    };
  },
  addKeyboardShortcuts() {
    return this.options.levels.reduce((items, level) => ({
      ...items, ...{ [`Mod-Alt-${level}`]: () => this.editor.commands.setHeading(createDefaultHeadingAttributes(level)) },
    }), {});
  },

  // -- Plugin --------------------------------------------------------------------
  addProseMirrorPlugins() { return [ HeadingPlugin()]; },

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
          }/* else -- the resulting Node Content is valid, set Heading Block Type */

          const { tr } = state;
          const storedMarks = JSON.stringify([createBoldMark(state.schema)]);

          tr.delete(range.from, range.to)
            .setBlockType(range.from, range.from, this.type, { level })
            .insert(tr.selection.$anchor.pos, createMarkHolderNode(state.schema, { storedMarks } ));

          return/*nothing left to do*/;
        },
      });
    });
  },

  // -- View ----------------------------------------------------------------------
  parseHTML() { return this.options.levels.map((level: HeadingLevel) => ({ tag: `h${level}` })); },
  renderHTML({ node, HTMLAttributes }) { return getNodeOutputSpec(node, HTMLAttributes); },
});
