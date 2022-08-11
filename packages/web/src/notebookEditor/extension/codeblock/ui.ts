// ********************************************************************************
// == Util ========================================================================
export const createCodeBlock = () => {
  const container = document.createElement('div');

  const paragraph = document.createElement('p');

  container.appendChild(paragraph);

  return { innerContainer: container, paragraph };
};
