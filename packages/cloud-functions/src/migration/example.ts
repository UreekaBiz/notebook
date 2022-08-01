import { DocumentReference, FieldValue } from 'firebase-admin/firestore';

import { Notebook_Storage } from '@ureeka-notebook/service-common';

import { notebookCollection } from '../notebook/datastore';
import { DeleteField } from '../util/firestore';
import { MigrationTask } from './type';

// example Migration Tasks
// NOTE: these must *not* be run in production!
// ********************************************************************************
export const exampleNotebookAddFieldMigration: MigrationTask<Notebook_Storage> = {
  query: notebookCollection/*all Notebooks*/,
  migrate: async (snapshot) => {
    // simply append a dummy field to the Notebook
    // NOTE: the timestamps must *not* change since this is just a data migration
    const domainReportDoc = snapshot.ref as DocumentReference<Partial<Notebook_Storage> & { dummyField: string; }>;
    await domainReportDoc.update({
      dummyField: 'dummyValue',
    })/*throws on error*/;

    return true/*success*/;
  },
};

export const exampleNotebookRemoveFieldMigration: MigrationTask<Notebook_Storage> = {
  query: notebookCollection/*all Notebooks*/,
  migrate: async (snapshot) => {
    // simply remove the appended dummy field from the Notebook
    // NOTE: the timestamps must *not* change since this is just a data migration
    const domainReportDoc = snapshot.ref as DocumentReference<Partial<Notebook_Storage> & { dummyField: FieldValue; }>;
    await domainReportDoc.update({
      dummyField: DeleteField/*remove*/,
    })/*throws on error*/;

    return true/*success*/;
  },
};
