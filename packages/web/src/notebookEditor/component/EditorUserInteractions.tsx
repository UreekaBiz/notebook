import { useEffect, useState } from 'react';

import { MarkName, NodeName } from '@ureeka-notebook/web-service';

import { getDialogStorage } from 'notebookEditor/model/DialogStorage';
import { useValidatedEditor } from 'notebookEditor/hook/useValidatedEditor';
import { isNodeSelection } from 'notebookEditor/extension/util/node';
import { isValidHTMLElement } from 'notebookEditor/extension/util/parse';
import { TOOL_ITEM_DATA_TYPE } from 'notebookEditor/toolbar/type';

import { ImageDialog } from './ImageDialog';
import { LinkDialog } from './LinkDialog';

// ********************************************************************************
// handles Editor-related logic that requires the use of hooks (and hence it must
// be a component)
export const EditorUserInteractions = () => {
  const editor = useValidatedEditor();

  // == State =====================================================================
  // -- Image ---------------------------------------------------------------------
  const imageStorage = getDialogStorage(editor, NodeName.IMAGE);
  const shouldInsertImage = imageStorage?.getShouldInsertNodeOrMark();
  const [isCreatingImage, setIsCreatingImage] = useState(false);

  // -- Link ----------------------------------------------------------------------
  const linkStorage = getDialogStorage(editor, MarkName.LINK);
  const shouldInsertLink = linkStorage?.getShouldInsertNodeOrMark();
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // == Effects ===================================================================
  // -- Image ---------------------------------------------------------------------
  // Listen for editor storage to see if image should be modified (SEE: Image.ts)
  useEffect(() => {
    if(!shouldInsertImage) return;

    setIsCreatingImage(true);
  }, [shouldInsertImage]);

  // -- Link ----------------------------------------------------------------------
  // Listen for editor storage to see if link should be inserted (SEE: Link.ts)
  useEffect(() => {
    if(!shouldInsertLink) return;

    setIsCreatingLink(true);
  }, [shouldInsertLink]);

  // ------------------------------------------------------------------------------
  // Handles shortcuts with the editor that requires interaction with a React state.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if(!editor) return/*nothing to do*/;
      if(event.code === 'KeyI' && event.ctrlKey && event.altKey) {
        event.preventDefault();
        // NOTE: This is needed to remove the focus of the editor so that
        //       the cursor is in the right position when the editor is
        //       focused back by closing the dialog
        if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
        /* else -- is not active element */

        setIsCreatingImage(true);
        return/*nothing to do*/;
      } // else -- not creating image

      if(event.code === 'KeyK' && event.altKey && event.metaKey) {
        event.preventDefault();
        // NOTE: This is needed to remove the focus of the editor so that
        //       the cursor is in the right position when the editor is
        //       focused back by closing the dialog
        if(document.activeElement instanceof HTMLElement) document.activeElement.blur();
        /* else -- do not blur */

        // NOTE: Check to see if link mark active right ahead. This would
        //       normally be checked for by the 'inclusive' property of the
        //       markSpec, but since its set to false (cause one would not)
        //       want the mark to be active after having inserted a link,
        //       (SEE: common/link.ts), this check has to be done
        const { $from } = editor.state.selection,
              linkMarkActive = editor.isActive(MarkName.LINK) || editor.state.doc.rangeHasMark($from.pos, $from.pos+1, editor.state.schema.marks[MarkName.LINK]);
        if(linkMarkActive) {
          editor.chain().focus().unsetLink().run();
          return;
        }/* else -- link mark not active, add a new one */
        setIsCreatingLink(true);
      } // else -- not creating link

      if(event.code === 'Period' && event.altKey && event.metaKey) {
        // Selects the first item in the toolbar
        event.preventDefault();

        const toolItems = [...document.querySelectorAll(`[datatype=${TOOL_ITEM_DATA_TYPE}]`)];
        if(toolItems.length < 1) return/*nothing to do*/;

        const firstToolItem = toolItems[0];
        if(!isValidHTMLElement(firstToolItem)) { console.warn('toolItem is not a valid HTML Element'); return/*do nothing*/;}
        /* else -- valid html element */

        firstToolItem.focus();
      } //else -- not selecting first item in toolbar

      if(event.code === 'Comma' && event.altKey && event.metaKey) {
        event.preventDefault();

        // Focus the last focused item. If none select the editor.
        if(isNodeSelection(editor.state.selection)) editor.chain().focus().setNodeSelection(editor.state.selection.$anchor.pos);
        else editor.commands.focus();
      } // else -- not selecting editor
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editor]);


  // == Handlers ==================================================================
  // -- Image ---------------------------------------------------------------------
  const handleCloseImageDialog = () => {
    if(!editor || !imageStorage) return/*nothing to do*/;

    setIsCreatingImage(false);
    imageStorage.setShouldInsertNodeOrMark(false);

    // NOTE: if Editor is destroyed before the timeout runs, it wont be focused
    //       (i.e. no major side effects besides that)
    // Focus editor after the react re-render
    setTimeout(() => editor.commands.focus(), 150/*T&E*/);
  };

  // -- Link ----------------------------------------------------------------------
  const handleCloseLinkDialog = () => {
    if(!editor || !linkStorage) return;

    setIsCreatingLink(false);
    linkStorage.setShouldInsertNodeOrMark(false);

    // NOTE: if Editor is destroyed before the timeout runs, it wont be focused
    //       (i.e. no major side effects besides that)
    // focus Editor after the react re-render
    setTimeout(() => editor.commands.focus(), 150/*T&E*/);
  };

  // == UI ========================================================================
  if(!editor) return null/*nothing to do*/;

  if(isCreatingImage) return <ImageDialog editor={editor} isOpen={true/*by definition*/} onClose={handleCloseImageDialog} />;

  if(isCreatingLink) return <LinkDialog editor={editor} isOpen={isCreatingLink} onClose={handleCloseLinkDialog} />;

  return null;/*nothing to render*/
};
