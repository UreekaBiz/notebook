import { httpsCallable } from 'firebase/functions';

import { VersionWrite_Rest } from '@ureeka-notebook/service-common';

import { functions } from '../util/firebase';
import { wrapHttpsCallable } from '../util/function';

// ** Admin-Only ******************************************************************
// == Version =====================================================================
export const versionWrite = wrapHttpsCallable<VersionWrite_Rest>(httpsCallable(functions, 'versionWrite'));
