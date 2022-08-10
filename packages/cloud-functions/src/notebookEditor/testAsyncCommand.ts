import { sleep } from '@ureeka-notebook/service-common';

import { CommandGenerator } from './executeAsyncCommand';

// ********************************************************************************
// == Command =====================================================================
// inserts multiple numbers at random positions in the Notebook
export const insertNumbers = (): CommandGenerator => async () => {
  // simulate some 'long running' async operation
  await sleep(3000/*ms*/);

  return ({
    name: 'insertNumbers',
    command: (editorState) => {
      // TODO: ensure that the desired Node exists, etc.

      return (tr) => {
        // inserts 10 (arbitrary) characters at random positions in the document
        for(let i=0; i<10; i++) {
          const position = Math.floor(Math.random() * tr.doc.content.size) + 1/*start of valid content*/;
          tr.insertText(String(i), position, position);
        }
        return true/*command can be performed*/;
      };
    },
  });
};

// inserts the specified text at the start of the the specified Notebook
export const insertText = (text: string): CommandGenerator => async () => {
  // simulate some 'long running' async operation
  await sleep(3000/*ms*/);

  return ({
    name: 'insertText',
    command: (editorState) => {
      // TODO: ensure that the desired Node exists, etc.

      return (tr) => {
        tr.insertText(text, 1, 1/*start of document*/);
        return true/*Command can be performed*/;
      };
    },
  });
};
