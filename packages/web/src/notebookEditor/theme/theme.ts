import { notebookEditorTheme } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == CSS =========================================================================
// NOTE: all of these must match index.css
// .. General .....................................................................
export const LIGHT_GRAY = '#E2E8F0';
export const FOCUS_COLOR = '#5E9ED6';
export const ACTIVE_BUTTON_COLOR = '#E2E8F0';

// .. Button ......................................................................
export const ICON_BUTTON_CLASS = 'iconButton';

// .. Node ........................................................................
// added to the selected Node by default by ProseMirror
export const PM_SELECTED_CLASS = 'ProseMirror-selectednode';
export const INLINE_NODE_CONTAINER_CLASS = 'inlineNodeContainer';
export const SELECTED_TEXT_CLASS = 'selected_text';

// .. Chip ........................................................................
export const CHIP_CLASS = 'chip';
export const CHIP_CLOSE_BUTTON_CLASS = 'chipCloseButton';

// == Editor Theme ================================================================
// updates the theme stylesheet with the current Theme. This function must be
  // called whenever the Theme is updated
  export const setThemeStylesheet = () => {
    const stylesheet = notebookEditorTheme.getStylesheet();

    // get existing stylesheet
    let existingStyleSheet = document.querySelector('#theme-stylesheet');

    // create a new style elements and append it to the document head
    if(!existingStyleSheet) {
      existingStyleSheet = document.createElement('style');
      existingStyleSheet.setAttribute('id', 'theme-stylesheet');
      document.head.appendChild(existingStyleSheet);
    } /* else -- style element already exists */

    existingStyleSheet.textContent = stylesheet;
  };
