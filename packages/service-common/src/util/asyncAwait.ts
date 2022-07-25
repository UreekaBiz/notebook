// convenience utilities for working with async-await
// ********************************************************************************

// waits for the specified condition to return true. Checks every `wait` milliseconds
// and waits no longer than `noLongerThan` milliseconds
export const waitFor = (fn: () => boolean, wait: number = 100/*0.1s*/, noLongerThan: number = 3000/*3s*/) => {
  noLongerThan = Math.max(wait, noLongerThan)/*ensure that `noLongerThan` is never less than `wait`*/;

  const startTime = Date.now();
  const poll = (resolve: (value: void) => void, reject: () => void) => {
    if(fn()) resolve();
    else if((Date.now() - startTime) >= noLongerThan) reject();
    else setTimeout(_ => poll(resolve, reject), wait);
  };
  return new Promise(poll);
};

// --------------------------------------------------------------------------------
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));