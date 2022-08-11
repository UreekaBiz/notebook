import { Select } from '@chakra-ui/react';
import { useState, ChangeEventHandler } from 'react';

import { notebookEditorTheme, ThemeName, Themes } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const SetThemeToolItem: React.FC<Props> = ({ editor }) => {
  const [theme, setTheme] = useState<ThemeName>(ThemeName.Default);

  // == Handler ===================================================================
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = event.target.value as ThemeName/*by contract*/;
    setTheme(value);

    const theme = Themes[value];
    notebookEditorTheme.setTheme(theme);
  };

  // == UI ========================================================================
  return (
    <Select value={theme} onChange={handleChange} flexBasis='30%' placeholder='Theme' size='sm' width={200}>
      {Object.entries(ThemeName).map(([key, value]) => (<option key={key} value={value}>{value}</option>))}
    </Select>
  );
};
