import { getLogger, ServiceLogger } from '../logging';

const log = getLogger(ServiceLogger.UTIL);

// convenience methods for working with 'process'-like concepts
// ********************************************************************************

// runs the specified function on the next tick (as a 'microtask')
export const nextTick = (callback: () => void) => {
  // REF: https://stackoverflow.com/questions/38752620/promise-vs-settimeout
  Promise.resolve().then(callback)
                   .catch(error => log.error(error))/*don't allow exceptions to go unreported!*/;
};
