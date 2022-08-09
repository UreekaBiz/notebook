// convenience methods for working with maps
// ********************************************************************************
/** @returns `true` if all entries from map 'a' are '===' to map 'b' */
export const mapEquals = <K, V>(a: Map<K, V>, b: Map<K, V>): boolean => {
  if(a.size !== b.size) return false/*cannot be equal if different sizes*/;

  // NOTE: uses 'for' instead of 'forEach' for performance
  for(const [key, value] of a) {
    if(!b.has(key) || (b.get(key) !== value)) return false/*differs -- early exit*/;
  }

  return true/*all entries match*/;
};
