import { Checkpoint, NO_NOTEBOOK_VERSION } from './type';

// ********************************************************************************
export const getLastCheckpointIndex = (checkpoint: Checkpoint | undefined/*none*/) => (checkpoint === undefined) ? NO_NOTEBOOK_VERSION/*by contract*/ : checkpoint.index;
