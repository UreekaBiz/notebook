import { Box, Flex, Select } from '@chakra-ui/react';
import { useState, ChangeEventHandler } from 'react';

import { notebookEditorTheme, ThemeName, Themes } from '@ureeka-notebook/web-service';

import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const SetThemeToolItem: React.FC<Props> = () => {
  // == State =====================================================================
  const [theme, setTheme] = useState<ThemeName>(ThemeName.Default);

  // == Handler ===================================================================
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = event.target.value as ThemeName/*by contract*/;
    const theme = Themes[value];

    if(!theme) return/*invalid value -- ignore*/;
    setTheme(value);
    notebookEditorTheme.setTheme(theme);
  };

  // == UI ========================================================================
  return (
    <Box>
      Theme
      <Flex marginTop='5px'>
        <Select value={theme} onChange={handleChange} size='sm' width={200}>
          {/*placeholder*/}
          <option disabled value=''>Theme</option>
          {Object.entries(ThemeName).map(([key, value]) => (<option key={key} value={value}>{value}</option>))}
        </Select>
      </Flex>
    </Box>
  );
};
