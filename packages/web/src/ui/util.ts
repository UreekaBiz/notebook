// ********************************************************************************
/** gets a minified readable version of the date */
export const getMinifiedReadableDate = (date: Date) => {
  // TODO: Implement a nicer minified date format.
  const dateString = date.toLocaleDateString();

  return dateString;
};
