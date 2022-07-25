// ********************************************************************************
// Utility function for throttling execution of the given function
export function throttle<T>(fn: (args: T) => void, time = 1000){
  let isWaiting = true;

  setTimeout(() => isWaiting = false, time);

  return (args: T) => {
    if(isWaiting) { return/*nothing to do*/; }

    isWaiting = true;
    fn(args);

    setTimeout(() => isWaiting = false, time);
  };
}
