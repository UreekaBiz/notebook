import { DocumentReference } from 'firebase-admin/firestore';

import { userConfigurationSchemaMap, Identifier, UserConfiguration_Create, UserConfiguration_Update, UserConfiguration_Storage, UserConfigurationType, UserIdentifier } from '@ureeka-notebook/service-common';

import { firestore } from '../firebase';
import { ApplicationError } from '../util/error';
import { ServerTimestamp } from '../util/firestore';
import { validateData } from '../util/function';
import { userConfigurationCollection, userConfigurationDocument } from './datastore';

// ********************************************************************************
// == Create ======================================================================
export const createUserConfiguration = async (
  userId: UserIdentifier,
  type: UserConfigurationType, order: number, payload: any/*intentional -- schema validated by type*/
): Promise<Identifier> => {
  validatePayload(payload, type)/*throws on error*/;

  const userConfigurationRef = userConfigurationCollection(userId).doc(/*create new*/) as DocumentReference<UserConfiguration_Create>,
        userConfigurationId = userConfigurationRef.id;
  try {
    const userConfiguration: UserConfiguration_Create = {
      type,
      order,

      payload,

      createdBy: userId,
      createTimestamp: ServerTimestamp/*by contract*/,
      lastUpdatedBy: userId,
      updateTimestamp: ServerTimestamp/*by contract*/,
    };
    await userConfigurationRef.create(userConfiguration)/*create by definition*/;
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error creating new User Configuration for User (${userId}). Reason: `, error);
  }

  return userConfigurationId;
};

// == Update ======================================================================
export const updateUserConfiguration = async (
  userId: UserIdentifier,
  configId: Identifier,
  order: number, payload: any/*intentional -- schema validated by type*/
) => {
  try {
    const userConfigurationRef = userConfigurationDocument(userId, configId) as DocumentReference<UserConfiguration_Update>;
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(userConfigurationRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot update non-existing User Configuration (${configId}) for User (${userId}).`);
      const existingUserConfiguration = snapshot.data()! as UserConfiguration_Storage<any>/*by definition*/;

      validatePayload(payload, existingUserConfiguration.type)/*throws on error*/;

      const userConfiguration: UserConfiguration_Update = {
        order,

        payload,

        lastUpdatedBy: userId/*by contract*/,
        updateTimestamp: ServerTimestamp/*server-written*/,
      };
      transaction.update(userConfigurationRef, userConfiguration);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error updating User Configuration (${configId}) for User (${userId}). Reason: `, error);
  }
};

// == Delete ======================================================================
export const deleteUserConfiguration = async (userId: UserIdentifier, configId: Identifier) => {
  try {
    const userConfigurationRef = userConfigurationDocument(userId, configId);
    await firestore.runTransaction(async transaction => {
      const snapshot = await transaction.get(userConfigurationRef);
      if(!snapshot.exists) throw new ApplicationError('functions/not-found', `Cannot delete non-existing User Configuration (${configId}) for User (${userId}).`);

      transaction.delete(userConfigurationRef);
    });
  } catch(error) {
    if(error instanceof ApplicationError) throw error;
    throw new ApplicationError('datastore/write', `Error deleting User Configuration (${configId}) for User (${userId}). Reason: `, error);
  }
};

// == Payload Schema Validation ===================================================
// validate the payload against the type-based schema
const validatePayload = (type: UserConfigurationType, payload: any) => {
  const schema = userConfigurationSchemaMap.get(type);
  if(!schema) throw new ApplicationError('devel/config', `No schema defined for User Configuration Type (${type}).`);

  validateData(payload, schema);
};
