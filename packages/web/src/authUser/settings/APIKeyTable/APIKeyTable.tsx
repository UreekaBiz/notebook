import { Box, Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';

import { AuthUserService, APIKey } from '@ureeka-notebook/web-service';

import { useAuthedUser } from 'authUser/hook/useAuthedUser';

import { APIKeyTableItem } from './APIKeyTableItem';

// ********************************************************************************
export const APIKeyTable: React.FC = () => {
  const auth = useAuthedUser();

  // == Handlers ==================================================================
  // NOTE: Errors will be handled by the APIKeyTableItem component since it's
  //       needed to display errors and handle states.
  const handleApiKeyRemove = async (apiKey: APIKey) => {
    // remove the API Key by setting the value to `undefined` (by contract)
    const apiKeys = { [apiKey]: undefined/*removes field*/ };

    return AuthUserService.getInstance().updateProfile({ apiKeys });
  };

  // == UI ========================================================================
  return (
    <Box>
      <TableContainer>
        <Table size='md'>
          <Thead>
            <Tr>
              <Th>Vendor</Th>
              <Th>Value</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(auth?.profilePrivate.apiKeys ?? {}).map(([apiKey, value]) => (
              <APIKeyTableItem key={apiKey} apiKey={apiKey as APIKey} value={value} handleRemove={handleApiKeyRemove} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
