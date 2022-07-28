import { collection, doc, orderBy, query, where, CollectionReference, Query } from 'firebase/firestore';

import { isBlank, isType, nameof, Notebook, NotebookIdentifier, PublishedNotebook, PublishedNotebookIdentifier, NOTEBOOKS, NOTEBOOK_PUBLISHED_NOTEBOOKS } from '@ureeka-notebook/service-common';

import { firestore } from '../util/firebase';
import { NotebookFilter, NotebookSort, PublishedNotebookFilter, PublishedNotebookSort } from './type';

// ********************************************************************************
// == Collection ==================================================================
// -- Notebook ---------------------------------------------------------------------
export const notebookCollection = collection(firestore, NOTEBOOKS) as CollectionReference<Notebook>;
export const notebookDocument = (notebookId: NotebookIdentifier ) => doc(notebookCollection, notebookId);

// -- Published Notebook ----------------------------------------------------------
export const publishedNotebookCollection = collection(firestore, NOTEBOOK_PUBLISHED_NOTEBOOKS) as CollectionReference<PublishedNotebook>;
export const publishedNotebookDocument = (publishedNotebookId: PublishedNotebookIdentifier ) => doc(publishedNotebookCollection, publishedNotebookId);

// == Query =======================================================================
// -- Notebook --------------------------------------------------------------------
export const notebookQuery = (filter: NotebookFilter) => {
  let buildQuery = notebookCollection as Query<Notebook>;

  // filter
  if(!isBlank(filter.name)) {
    // TODO: support substring!!
    buildQuery = query(buildQuery, where(nameof<Notebook>('name'), '==', filter.name!));
  } /* else -- 'name' was not specified in the filter */
  if(!isBlank(filter.createdBy)) {
    buildQuery = query(buildQuery, where(nameof<Notebook>('createdBy'), '==', filter.createdBy!));
  } /* else -- 'createdBy' was not specified in the filter */

  // if no filter is applied then both deleted and non-deleted entries are included.
  // * If only-deleted then include only deleted = true
  // * If nothing is specified then only include non-deleted (i.e. deleted = false)
  let includeDeleted = ((filter.deleted === true) || (filter.onlyDeleted === true));
  if(filter.onlyDeleted === true) {
    buildQuery = query(buildQuery, where(nameof<Notebook>('deleted'), '==', true));
  } /* else -- don't limit to only (soft) deleted entries */
  if(!includeDeleted) {
    buildQuery = query(buildQuery, where(nameof<Notebook>('deleted'), '==', false));
  } /* else -- (soft) deleted entries should be included */

  // sort
  // REF: https://firebase.google.com/docs/firestore/query-data/order-limit-data
  const sort: NotebookSort[] = [];
  if(filter.sort && (filter.sort.length > 0))
    sort.push(...filter.sort);
  else/*sort not specified so use defaults*/
    sort.push(isType<NotebookSort>({ field: 'name', direction: 'asc' }/*default by contract*/));
  buildQuery = sort.reduce((sortQuery, sort) => query(sortQuery, orderBy(sort.field, sort.direction)), buildQuery);

  return buildQuery;
};

// -- Published Notebook ----------------------------------------------------------
export const publishedNotebookQuery = (filter: PublishedNotebookFilter) => {
  let buildQuery = publishedNotebookCollection as Query<PublishedNotebook>;

  // filter
  if(!isBlank(filter.title)) {
    // TODO: support substring!!
    buildQuery = query(buildQuery, where(nameof<PublishedNotebook>('title'), '==', filter.title!));
  } /* else -- 'title' was not specified in the filter */
  if(!isBlank(filter.createdBy)) {
    buildQuery = query(buildQuery, where(nameof<PublishedNotebook>('createdBy'), '==', filter.createdBy!));
  } /* else -- 'createdBy' was not specified in the filter */

  // TODO: Implement soft-deletion filter
  // // if no filter is applied then both deleted and non-deleted entries are included.
  // // * If only-deleted then include only deleted = true
  // // * If nothing is specified then only include non-deleted (i.e. deleted = false)
  // let includeDeleted = ((filter.deleted === true) || (filter.onlyDeleted === true));
  // if(filter.onlyDeleted === true) {
  //   buildQuery = query(buildQuery, where(nameof<PublishedNotebook>('deleted'), '==', true));
  // } /* else -- don't limit to only (soft) deleted entries */
  // if(!includeDeleted) {
  //   buildQuery = query(buildQuery, where(nameof<PublishedNotebook>('deleted'), '==', false));
  // } /* else -- (soft) deleted entries should be included */

  // sort
  // REF: https://firebase.google.com/docs/firestore/query-data/order-limit-data
  const sort: PublishedNotebookSort[] = [];
  if(filter.sort && (filter.sort.length > 0))
    sort.push(...filter.sort);
  else/*sort not specified so use defaults*/
    sort.push(isType<PublishedNotebookSort>({ field: 'title', direction: 'asc' }/*default by contract*/));
  buildQuery = sort.reduce((sortQuery, sort) => query(sortQuery, orderBy(sort.field, sort.direction)), buildQuery);

  return buildQuery;
};
