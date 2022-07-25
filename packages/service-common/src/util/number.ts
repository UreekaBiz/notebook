// convenience functions for working with Numbers
// ********************************************************************************

// == Array =======================================================================
export type Range = [number/*min*/, number/*max*/];
export const range = (values: number[], range?: Range): Range | undefined/*no range*/ => {
  if(values.length < 1) return range;

  let [min, max] = (range === undefined) ? [values[0], values[0]]/*default*/ : range;
  for(const value of values) {
    if(value < min) min = value;
    else if(value > max) max = value;
  }
  return [min, max];
};

// ................................................................................
export const generateRange = ([min, max]: Range, step = 1) =>
  Array.from({ length: (max - min) / step + 1 }, (_, i) => min + (i * step));
