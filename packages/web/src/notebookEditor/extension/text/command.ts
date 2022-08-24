import { Command } from '@ureeka-notebook/web-service';

// ********************************************************************************
/** Inserts a Tab. (SEE: ExtensionPriority) for details on handling */
export const insertTabCommand: Command = (state, dispatch) => {
  const { tr } = state;
  tr.insertText('\t');

  if(dispatch) dispatch(tr);
  return true/*command can be executed*/;
};
