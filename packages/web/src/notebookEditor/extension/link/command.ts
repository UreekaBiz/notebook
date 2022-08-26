import { setMarkCommand, toggleMarkCommand, unsetMarkCommand, Command, LinkAttributes, MarkName, PREVENT_LINK_META } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Implementation ==============================================================
// NOTE: the desired behavior for these Commands is that creating a Link in a
//       Range that includes Nodes that should not have Links (e.g. a Selection
//       that spans Text and CodeBlock Nodes) should create two separate Links,
//       one before the CodeBlock and another one past it
export const setLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  state.tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
  return setMarkCommand(state.schema, MarkName.LINK, attributes)(state, dispatch);
};

export const toggleLinkCommand = (attributes: Partial<LinkAttributes>): Command => (state, dispatch) => {
  state.tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
  return toggleMarkCommand(state.schema,  MarkName.LINK, attributes)(state, dispatch);
};

export const unsetLinkCommand = (): Command => (state, dispatch) => {
  state.tr.setMeta(PREVENT_LINK_META, true/*(SEE: ../plugin.ts)*/);
  return unsetMarkCommand(MarkName.LINK, true/*extend empty Mark Range*/)(state, dispatch);
};
