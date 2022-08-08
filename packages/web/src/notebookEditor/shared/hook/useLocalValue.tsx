import { useCallback, useEffect, useState } from 'react';

// ********************************************************************************
// Utility hook that stores a local state for a component that is given from an
// external source, this value will update the external source only when the user
// decides to.
// Sync the local state with external source when this value is not being updated.
// Exposes utility functions to control this state.
//
// A use case is an input that modifies a value and commits the change to a external
// entity, but this value should only be updated once after the user stops making
// changes and the external entity could also update the value.
//
// An optional focus parameter can be passed to the update function to indicate if
// the Editor should be focused after the update.
// NOTE: not arrow function due to use of generic type
export function useLocalValue<T>(value: T, update: (newValue: T, focus?: boolean) => void) {
  // == State =====================================================================
  const [localValue, setLocalValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false/*by contract*/);

  // == Effect ====================================================================
  // Sync the value from the original source with the local value. If the local
  // value is being updated (isUpdating its true) it won't update it.
  useEffect(() => {
    if(isUpdating) return/*nothing to do*/;
    setLocalValue(value);

    // Explicitly ignore isUpdating since this only depends on value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const updateLocalValue = useCallback((newValue: T) => {
    setLocalValue(newValue);
    setIsUpdating(true);
  }, []);

  const commitChange = useCallback((value?: T, focus?: boolean) => {
    update(value ?? localValue, focus);
    setIsUpdating(false);
  }, [localValue, update]);

  const resetLocalValue = useCallback(() => {
    setLocalValue(value);
    setIsUpdating(false);
  }, [value]);


  return { localValue, isUpdating, updateLocalValue, commitChange, resetLocalValue };
}
