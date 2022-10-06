import { camelToKebabCase } from '../../../util';
import { AttributeType } from '../attribute';
import { HeadingLevel } from '../extension/heading';
import { DATA_NODE_TYPE } from '../htmlRenderer/type';
import { MarkName } from '../mark';
import { NodeName } from '../node';
import { CustomSelector, DefaultTheme, Theme, ThemeElement } from './type';

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
// TODO: Initialize the theme without a default value since the value will be set
//       by the user.
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
export const getThemeValue = (nodeOrMarkName: NodeName | MarkName, attribute: AttributeType): string | undefined/*no value in Theme*/ => {
  const themeElement = getThemeElement(nodeOrMarkName);
  const value = themeElement[attribute];

  if(typeof value === 'string') return value;
  if(typeof value !== 'undefined') { console.error(`Unexpected value type for (${nodeOrMarkName}) theme attribute (${attribute}): ${value}`); return undefined/*unexpected value, default to no value*/; }

  return value/*valid but undefined*/;
};

// gets the Color or FontSize for a Heading from the Theme
// NOTE: Heading Nodes are a special case since the FontSize and Color are
//       defined by its level, in this case a special CustomSelector is used and
//       must be manually matched here
export const getHeadingThemeValue = (attribute: AttributeType.FontSize | AttributeType.Color, level: HeadingLevel): string | undefined => {
  const theme = notebookEditorTheme.getTheme();
  const { customSelectors } = theme;
  switch(level) {
    case HeadingLevel.One: return customSelectors[CustomSelector.HeadingLevelOne][attribute];
    case HeadingLevel.Two: return customSelectors[CustomSelector.HeadingLevelTwo][attribute];
    case HeadingLevel.Three: return customSelectors[CustomSelector.HeadingLevelThree][attribute];
    case HeadingLevel.Four: return customSelectors[CustomSelector.HeadingLevelFour][attribute];
    case HeadingLevel.Five: return customSelectors[CustomSelector.HeadingLevelFive][attribute];
    case HeadingLevel.Six: return customSelectors[CustomSelector.HeadingLevelSix][attribute];
  }
};
