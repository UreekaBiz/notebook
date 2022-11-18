import { find, test } from 'linkifyjs';
import { Plugin, PluginKey } from 'prosemirror-state';

import { combineTransactionSteps, findChildrenInRange, getTransformChangedRanges, getLinkMarkType, getMarksBetween, isLinkMark, isNodeSelection, AttributeType, LinkTarget, PREVENT_LINK_META } from '@ureeka-notebook/web-service';

import { NoPluginState } from 'notebookEditor/model/type';

import { linkIsInDoc } from '../util';

// ********************************************************************************
// Plugin that automatically creates a link when the user writes a text that is a
// valid link.

// == Plugin ======================================================================
const linkCreateKey = new PluginKey<NoPluginState>('linkCreateKey');
export const linkCreate = (validate?: (url: string) => boolean): Plugin => {
  return new Plugin({
    // -- Setup -------------------------------------------------------------------
    key: linkCreateKey,

    // -- Transaction -------------------------------------------------------------
    // NOTE: this is inspired by https://github.com/ueberdosis/tiptap/blob/main/packages/extension-link/src/helpers/autolink.ts
    // ensures that Link get created when the user types something that is a valid
    // Link in the editor
    appendTransaction: (transactions, oldState, newState) => {
      const docChanged = transactions.some(transaction => transaction.docChanged) && !oldState.doc.eq(newState.doc);
      const preventAutolink = transactions.some(transaction => transaction.getMeta(PREVENT_LINK_META));
      if(!docChanged || preventAutolink) return/*nothing to do*/;

      const linkMarkType = getLinkMarkType(newState.schema);
      const { tr } = newState,
            transform = combineTransactionSteps(oldState.doc, [...transactions]),
            { mapping } = transform,
            changes = getTransformChangedRanges(transform);

      if(isNodeSelection(tr.selection)) return tr/*not modified*/;

      changes.forEach(({ oldRange, newRange }) => {
        // check if Links need to be removed
        getMarksBetween(oldRange.from, oldRange.to, oldState.doc)
          .filter(item => isLinkMark(item.mark))
          .forEach(oldMark => {
            const newFrom = mapping.map(oldMark.from),
                  newTo = mapping.map(oldMark.to);
            const newMarks = getMarksBetween(newFrom, newTo, newState.doc).filter(item => isLinkMark(item.mark));
            if(!newMarks.length) return/*nothing to do*/;

            const newMark = newMarks[0]/*guaranteed to be link type by filter*/;
            const oldLinkText = oldState.doc.textBetween(oldMark.from, oldMark.to, undefined/*no Block separator*/, ' '/*add a space for each non-text leaf-node found*/),
                  newLinkText = newState.doc.textBetween(newMark.from, newMark.to, undefined/*no Block separator*/, ' '/*add a space for each non-text leaf-node found*/);
            const wasLink = test(oldLinkText),
                  isLink = test(newLinkText);

            // remove the Link only if there was a Link before and now it is not,
            // since manually added Links should not be removed
            if(wasLink && !isLink) tr.removeMark(newMark.from, newMark.to, linkMarkType);
          });

        // check if new Links can be added
        findChildrenInRange(newState.doc, newRange, node => node.isTextblock)
          .forEach(textBlock => {
            // a placeholder for Leaf Nodes must be defined
            // so that the Link position can be correctly calculated
            const text = newState.doc.textBetween(textBlock.position, textBlock.position + textBlock.node.nodeSize, undefined/*no Block separator*/, ' '/*add a space for each non-text leaf-node found*/);

            // do not turn TextBlock into Link when user just inserted a Link and
            // adds a space (since this would incorrectly turn the previous
            // Text in the Block into a Link too)
            if(text.endsWith(' ')) return/*prevent incorrect behavior*/;

            find(text)
              .filter(link => {
                if(!link.isLink) return false/*not a link*/;
                if(validate) return validate(link.value)/*delegate to function*/;

                return true/*found by default*/;
              })
              // calculate Link position
              .map(link => ({ ...link, from: textBlock.position + link.start + 1, to: textBlock.position + link.end + 1 }))

              // check if Link is within the changed range
              .filter(link => {
                const linkFromIsInRange = newRange.from >= link.from && newRange.from <= link.to;
                const linkToIsInRange = newRange.to >= link.from && newRange.to <= link.to;
                return linkFromIsInRange || linkToIsInRange;
              })

              // add Link mark
              .forEach(link => tr.addMark(link.from, link.to, linkMarkType.create({ [AttributeType.Href]: link.href, ...(linkIsInDoc(link.href) ? { [AttributeType.Target]: LinkTarget.SELF } : {/*nothing*/}) })));
          });
      });

      if(!tr.steps.length) return/*nothing to do*/;

      return tr/*modified*/;
    },
  });
};
