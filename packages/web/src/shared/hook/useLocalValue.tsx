import { useCallback, useEffect, useState } from 'react';

// ********************************************************************************
// hook that stores a local state for a component that is given from an external
// source. The value will update the external source only when the user decides to.
// Syncs the local state with external source when this value is not being updated.
// Exposes utility functions to control this state.
//
// A use case is an input that modifies a value and commits the change to a external
// entity, but this value should only be updated once after the user stops making
// changes and the external entity could also update the value.
// FIXME: why is this 'function' and all of the rest using arrow functions?
export function useLocalValue<T>(value: T, update: (newValue: T) => void) {
  // -- State ---------------------------------------------------------------------
  const [localValue, setLocalValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false/*by contract*/);

  // -- Effects -------------------------------------------------------------------
  // Sync the value from the original source with the local value. If the local
  // value is being updated (isUpdating its true) it won't update it.
  useEffect(() => {
    if(isUpdating) return/*nothing to do*/;
    setLocalValue(value);

    // Explicitly ignore isUpdating since this only depends on value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ..............................................................................
  const updateLocalValue = useCallback((newValue: T) => {
    setLocalValue(newValue);
    setIsUpdating(true);
  }, [/*only on mount/unmount*/]);

  const commitChange = useCallback((value?: T) => {
    update(value ?? localValue);
    setIsUpdating(false/*finished updating*/);
  }, [localValue, update]);

  const resetLocalValue = useCallback(() => {
    setLocalValue(value);
    setIsUpdating(false/*finished updating*/);
  }, [value]);


  return { localValue, isUpdating, updateLocalValue, commitChange, resetLocalValue };
}
