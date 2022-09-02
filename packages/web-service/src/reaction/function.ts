import { httpsCallable } from 'firebase/functions';

import { ReactionToggle_Rest } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ** Auth'd User *****************************************************************
// == Reaction ====================================================================
export const reactionToggle = wrapHttpsCallable<ReactionToggle_Rest, boolean>(httpsCallable(functions, 'reactionToggle'));
