// ********************************************************************************
// NOTE: the returned format is a Stackdriver Timestamp *NOT* a Firestore Timestamp
export const toStackdriverTimestamp = (date: Date) => {
  const millis = date.getTime();
  return {
    seconds: Math.floor(millis / 1000),
    nanos: (millis % 1000) * 1e6,
  };
};
