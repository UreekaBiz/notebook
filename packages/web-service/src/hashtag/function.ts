import { httpsCallable } from 'firebase/functions';

import { AdminHashtagRemoveUpdate_Rest } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ********************************************************************************
// == Admin-Only ==================================================================
export const adminHashtagRemoveUpdate = wrapHttpsCallable<AdminHashtagRemoveUpdate_Rest>(httpsCallable(functions, 'adminHashtagRemoveUpdate'));
