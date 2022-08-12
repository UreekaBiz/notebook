// CHECK: should this and debounce be in a single file?
// ********************************************************************************
// throttles execution of the specified function
export const throttle = <T extends (...args: any[]) => void>(fn: T, time = 1000): T => {
  let isWaiting = true;
  setTimeout(() => isWaiting = false, time);

  const throttled = (...args: Parameters<T>) => {
    if(isWaiting) return/*nothing to do*/;

    isWaiting = true;
    fn(...args);

    setTimeout(() => isWaiting = false, time);
  };

  return throttled as T;
};
