import { camelToKebabCase, AttributeType, HeadingLevel, MarkName, NodeName, DATA_NODE_TYPE } from '@ureeka-notebook/web-service';

import { CustomSelector, DefaultTheme, Theme, ThemeElement } from './type';

// NOTE: cannot be '@ureeka-notebook/web-service' since it relies on `document` (i.e. it is client-only)
// ********************************************************************************
// == Class =======================================================================
// A singleton that holds the Themes used on the Editor
class NotebookEditorTheme {
  /*FIXME: explicit*/ theme: Theme;

  // == Constructor ===============================================================
  constructor(theme: Theme) {
    this.theme = theme;
  }

  // == Accessors =================================================================
  /** Gets the current Theme */
  public getTheme() {
    return this.theme;
  }

  /** Sets a new Theme */
  public setTheme(theme: Theme) {
    this.theme = theme;
    this.setThemeStylesheet()/*sync stylesheet*/;
  }

  // updates the theme stylesheet with the current Theme. This function must be
  // called whenever the Theme is updated
  public setThemeStylesheet() {
    const stylesheet = this.getStylesheet();

    // get existing stylesheet
    let existingStyleSheet = document.querySelector('#theme-stylesheet');

    // create a new style elements and append it to the document head
    if(!existingStyleSheet) {
      existingStyleSheet = document.createElement('style');
      existingStyleSheet.setAttribute('id', 'theme-stylesheet');
      document.head.appendChild(existingStyleSheet);
    } /* else -- style element already exists */

    existingStyleSheet.textContent = stylesheet;
  }

  public getStylesheet() {
    const { nodes, marks, customSelectors } = this.theme;

    // creates a CSS class in the form of [DATA_NODE_TYPE="nodeName"] {} for each Node
    const nodeStyles = Object.keys(nodes).map(nodeName => {
      const nodeTheme = nodes[nodeName as NodeName/*by definition*/];

      // get "attribute: value;"
      const nodeAttributes = Object.keys(nodeTheme).map(attribute => {
        const value = nodeTheme[attribute as keyof typeof nodeTheme/*by definition*/];
        return `${camelToKebabCase(attribute)}: ${value};`;
      }).join('\n');

      const CSSClass = `[${DATA_NODE_TYPE}="${nodeName}"] { ${nodeAttributes} }`;
      return CSSClass;
    }).join('\n');

    // creates a CSS class in the form of [data-mark-type="markName"] {} for each Mark
    const markStyles = Object.keys(marks).map(markName => {
      const markTheme = marks[markName as MarkName/*by definition*/];

      // get "attribute: value;"
      const markAttributes = Object.keys(markTheme).map(attribute => {
        const value = markTheme[attribute as keyof typeof markTheme/*by definition*/];
        return `${camelToKebabCase(attribute)}: ${value};`;
      }).join('\n');

      const CSSClass = `[data-mark-type="${markName}"] { ${markAttributes} }`;
      return CSSClass;
    }).join('\n');

    // creates a CSS class with the given custom selector for each entry of the
    // customSelectors object
    const customSelectorsStyles = Object.keys(customSelectors).map(customSelector => {
      const customTheme = customSelectors[customSelector as keyof typeof customSelectors/*by definition*/];

      // get "attribute: value;"
      const customAttributes = Object.keys(customTheme).map(attribute => {
        const value = customTheme[attribute as keyof typeof customTheme/*by definition*/];
        return `${camelToKebabCase(attribute)}: ${value};`;
      }).join('\n');

      const CSSClass = `${customSelector} { ${customAttributes} }`;
      return CSSClass;
    }).join('\n');

    return `${nodeStyles}\n${markStyles}\n${customSelectorsStyles}`;
  }
}
// singleton class to manage the Theme
export const notebookEditorTheme = new NotebookEditorTheme(DefaultTheme);

// ================================================================================
export const getThemeElement = (nodeOrMarkName: NodeName | MarkName): ThemeElement => {
  const theme = notebookEditorTheme.getTheme();
  const { nodes, marks } = theme;

  const nodeName = nodeOrMarkName as NodeName,
        markName = nodeOrMarkName as MarkName;
  if(nodeOrMarkName in nodes) return nodes[nodeName]/*found*/;
  else if(nodeOrMarkName in marks) return marks[markName]/*found*/;

  return {/*empty*/};
};

// gets the Attribute value from the current Theme based on the Node name and
// Attribute type
// NOTE: this function must only be used to get the actual render value that is a
//       string (or undefined if not defined). If complex Attributes are needed
//       (e.g. Heading level) then the NodeTheme must be accessed directly. This
//       is required to avoid Type conflicts.
export const getThemeValue = (nodeOrMarkName: NodeName | MarkName, attribute: AttributeType): string | undefined/*FIXME: document*/ => {
  const themeElement = getThemeElement(nodeOrMarkName);
  const value = themeElement[attribute];

  if(typeof value === 'string') return value;
  if(typeof value !== 'undefined') { console.error(`Unexpected value type for (${nodeOrMarkName}) theme attribute (${attribute}): ${value}`); return undefined/*FIXME: document*/; }

  return value/*value is valid but undefined*/;
};

// gets the TextColor or FontSize for a Heading from the Theme
// NOTE: Heading Nodes are a special case since the FontSize and TextColor are
//       defined by its level, in this case a special CustomSelector is used and
//       must be manually matched here
export const getHeadingThemeValue = (attribute: AttributeType.FontSize | AttributeType.TextColor, level: HeadingLevel): string | undefined => {
  const theme = notebookEditorTheme.getTheme();
  const { customSelectors } = theme;
  switch(level) {
    case HeadingLevel.One: return customSelectors[CustomSelector.HeadingLevelOne][attribute];
    case HeadingLevel.Two: return customSelectors[CustomSelector.HeadingLevelTwo][attribute];
    case HeadingLevel.Three: return customSelectors[CustomSelector.HeadingLevelThree][attribute];
  }
};
