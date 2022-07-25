import { HStack, Input, Button } from '@chakra-ui/react';
import { useState } from 'react';

import { NotebookIdentifier } from '@ureeka-notebook/web-service';

// ********************************************************************************
interface Props { notebookId: NotebookIdentifier; }
export const NotebookTitleSection: React.FC<Props> = ({ notebookId }) => {
  // == State =====================================================================
  const [inputValue, setInputValue] = useState<string>('Default Document Title');

  // == Handlers ==================================================================
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value);

  // == UI ========================================================================
  return (
    <HStack spacing='24px' bg='gray.100'>
      <Input value={inputValue} width='25%' onChange={event => handleInputChange(event)} />
      <Button>File</Button>
      <Button>Edit</Button>
      <Button>View</Button>
      <Button>Insert</Button>
      <Button>Format</Button>
      <Button>Tools</Button>
      <Button>Add-Ons</Button>
      <Button>Help</Button>
    </HStack>
  );
};
