// ********************************************************************************
// == Util ========================================================================
/**
 * Swaps two elements from in array *in place*
 *
 * @param array The array whose elements will be swapped
 * @param swappedFrom The position that will be swapped to another position
 * @param swappedTo The destination position for the swapped position
 */
// FIXME: move out of the editor to service-common?
export const swap = (array: any[], swappedFrom: number, swappedTo: number) => {
  const tmp = array[swappedFrom];
  array[swappedFrom] = array[swappedTo];
  array[swappedTo] = tmp;
};
