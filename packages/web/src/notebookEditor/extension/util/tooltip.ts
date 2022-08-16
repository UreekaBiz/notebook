// ********************************************************************************
/** creates a tooltip DOM element */
export const createTooltip = (text?: string) => {
  const tooltip = document.createElement('div');
  tooltip.classList.add('node_tooltip');

  const tooltipText = document.createElement('div');

  tooltip.appendChild(tooltipText);
  updateTooltip(tooltip, text);

  return tooltip;
};
/** updates the content of the tooltip. If it doesn't have text content the node is
 *  hidden. */
export const updateTooltip = (tooltip: HTMLElement, text?: string) => {
  if(text) {
    tooltip.classList.remove('node_tooltip--hidden');
    const tooltipText = tooltip.firstChild;
    if(tooltipText) tooltipText.textContent = text;
  } else {
    // prevent the tooltip from being displayed when hovering the parent node
    tooltip.classList.add('node_tooltip--hidden');
  }
};
