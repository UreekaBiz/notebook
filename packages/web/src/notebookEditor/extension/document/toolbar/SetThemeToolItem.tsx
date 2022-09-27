import { Flex, Select, Text } from '@chakra-ui/react';
import { useState, ChangeEventHandler } from 'react';

import { notebookEditorTheme, ThemeName, Themes } from '@ureeka-notebook/web-service';

import { setThemeStylesheet } from 'notebookEditor/theme/theme';
import { EditorToolComponentProps } from 'notebookEditor/sidebar/toolbar/type';

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
    setThemeStylesheet();
  };

  // == UI ========================================================================
  return (
    <Flex alignItems='center'>
      <Text
        marginRight={1}
        color='#333'
        fontSize='12px'
        fontWeight='600'
      >
        Theme
      </Text>
      <Select value={theme} onChange={handleChange} size='xs' width={130}>
        <option disabled value=''>Theme</option> {/*placeholder*/}

        {Object.entries(ThemeName).map(([key, value]) => (<option key={key} value={value}>{value}</option>))}
      </Select>
    </Flex>
  );
};
