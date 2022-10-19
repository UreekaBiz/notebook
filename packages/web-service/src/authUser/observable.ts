import { UserConfigurationType, UserIdentifier } from '@ureeka-notebook/service-common';

import { defaultDocumentConverter, defaultTupleConverter } from '../util/firestore';
import { document } from '../util/observableDocument';
import { queryTuples } from '../util/observableTupleCollection';
import { userConfigurationsByTypeQuery, userProfilePrivateDocument } from './datastore';

// ********************************************************************************
// == Firebase Auth ===============================================================
// SEE: FirebaseAuthService

// == Private Profile =============================================================
export const profilePrivate$ = (userId: UserIdentifier) =>
  document(userProfilePrivateDocument(userId), defaultDocumentConverter);

// == User Configuration ==========================================================
export const userConfigurations$ = <T>(userId: UserIdentifier, type: UserConfigurationType) =>
  queryTuples(userConfigurationsByTypeQuery<T>(userId, type), defaultTupleConverter);
