// CHECK: should this and throttle be in a single file?
// ********************************************************************************
// debounce execution of the specified function
export const debounce = <T extends (...args: any[]) => void>(fn: T, time = 1000): T => {
  // reference to the timeout
  let reference: NodeJS.Timeout;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(reference);
    reference = setTimeout(() => fn(...args), time);
  };

  return debounced as T;
};
