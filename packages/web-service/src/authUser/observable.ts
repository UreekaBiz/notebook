import { UserIdentifier } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter } from '../util/firestore';
import { document } from '../util/observableDocument';
import { userProfilePrivateDocument } from './datastore';

// ********************************************************************************
// == Firebase Auth ===============================================================
// SEE: FirebaseAuthService

// == Private Profile =============================================================
export const profilePrivate$ = (userId: UserIdentifier) =>
  document(userProfilePrivateDocument(userId), defaultDocumentConverter);
