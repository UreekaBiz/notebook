// ********************************************************************************
// throttles execution of the specified function
export const throttle = <T>(fn: (args: T) => void, time = 1000) => {
  let isWaiting = true;

  setTimeout(() => isWaiting = false, time);

  return (args: T) => {
    if(isWaiting) return/*nothing to do*/;

    isWaiting = true;
    fn(args);

    setTimeout(() => isWaiting = false, time);
  };
};
