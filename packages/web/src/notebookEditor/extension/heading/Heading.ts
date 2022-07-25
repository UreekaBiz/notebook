import { textblockTypeInputRule, Node } from '@tiptap/core';

import { AttributeType, HeadingLevel, HeadingNodeSpec, NodeName, SetAttributeType } from '@ureeka-notebook/web-service';

import { NoStorage } from 'notebookEditor/model/type';

import { getOutputSpec, setAttributeFromTheme, setAttributeParsingBehavior } from '../util/attribute';
import { createDefaultHeadingAttributes, HeadingOptions, DEFAULT_HEADING_LEVEL, HEADING_ID } from './type';
import { setHeadingCommand, toggleHeadingCommand } from './command';

// NOTE: this Extension leverages the UniqueNodeId extension
// ********************************************************************************
// == Node ========================================================================
export const Heading = Node.create<HeadingOptions, NoStorage>({
  ...HeadingNodeSpec,

  // -- Attribute -----------------------------------------------------------------
  addAttributes() {
    return {
      id: setAttributeParsingBehavior('id', HEADING_ID, SetAttributeType.STRING),
      level: setAttributeParsingBehavior('level', DEFAULT_HEADING_LEVEL, SetAttributeType.NUMBER),
      initialMarksSet: setAttributeParsingBehavior('initialMarksSet', false, SetAttributeType.BOOLEAN),

      [AttributeType.FontSize]: setAttributeParsingBehavior(AttributeType.FontSize, undefined/*no default value*/, SetAttributeType.STRING),
      [AttributeType.TextColor]: setAttributeParsingBehavior(AttributeType.TextColor, undefined/*no default value*/, SetAttributeType.STRING),

      [AttributeType.PaddingTop]: setAttributeParsingBehavior(AttributeType.PaddingTop, '0px', SetAttributeType.STRING),
      [AttributeType.PaddingBottom]: setAttributeParsingBehavior(AttributeType.PaddingBottom, '0px', SetAttributeType.STRING),
      [AttributeType.PaddingLeft]: setAttributeParsingBehavior(AttributeType.PaddingLeft, '0px', SetAttributeType.STRING),
      [AttributeType.PaddingRight]: setAttributeParsingBehavior(AttributeType.PaddingRight, '0px', SetAttributeType.STRING),

      [AttributeType.MarginTop]: setAttributeParsingBehavior(AttributeType.MarginTop, '0px', SetAttributeType.STRING),
      [AttributeType.MarginLeft]: setAttributeFromTheme(AttributeType.MarginLeft, NodeName.HEADING),
      [AttributeType.MarginBottom]: setAttributeParsingBehavior(AttributeType.MarginBottom, '0px', SetAttributeType.STRING),
      [AttributeType.MarginRight]: setAttributeParsingBehavior(AttributeType.MarginRight, '0px', SetAttributeType.STRING),
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

  // -- Input ---------------------------------------------------------------------
  addInputRules() {
    return this.options.levels.map(level => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{1,${level}})\\s$`),
        type: this.type,
        getAttributes: { level },
      });
    });
  },

  // -- View ----------------------------------------------------------------------
  parseHTML() {
    return this.options.levels.map((level: HeadingLevel) => ({
      tag: `h${level}`,
      attrs: { level },
    }));
  },
  renderHTML({ node, HTMLAttributes }) { return getOutputSpec(node, this.options, HTMLAttributes); },
});
