import { useState } from 'react';

import { notebookEditorTheme, ThemeName, Themes } from '@ureeka-notebook/web-service';

import { InputToolItemContainer } from 'notebookEditor/extension/shared/component/InputToolItemContainer';
import { DropdownTool, DropdownToolItemType } from 'notebookEditor/extension/shared/component/DropdownToolItem/DropdownTool';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';
import { setThemeStylesheet } from 'notebookEditor/theme/theme';

// ********************************************************************************
// NOTE: Using directly DropdownTool instead of DropdownToolItem because this needs
//       doesn't update an Attribute.
const options: DropdownToolItemType[] = Object.entries(ThemeName).map(([key, value]) => ({ value, label: value }));

interface Props extends EditorToolComponentProps {/*no additional*/}
export const SetThemeToolItem: React.FC<Props> = () => {
  // == State =====================================================================
  const [theme, setTheme] = useState<ThemeName>(ThemeName.Default);

  // == Handler ===================================================================
  const handleChange = (value: string) => {
    const themeValue = value as ThemeName/*by definition*/;
    const theme = Themes[themeValue];

    if(!theme) return/*invalid value -- ignore*/;
    setTheme(themeValue);
    notebookEditorTheme.setTheme(theme);
    setThemeStylesheet();
  };

  // == UI ========================================================================


  return (
    <InputToolItemContainer name='Theme'>
      <DropdownTool value={theme} options={options} placeholder='Type' onChange={handleChange}/>
    </InputToolItemContainer>
  );
};
