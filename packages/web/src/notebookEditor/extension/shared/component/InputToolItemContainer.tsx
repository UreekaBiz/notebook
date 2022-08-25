import { Flex, Text } from '@chakra-ui/react';

// ********************************************************************************
interface Props {
  /** the name of the ToolItem */
  name: string;

  /** the input of the ToolItem */
  children: React.ReactNode;

  /** the content to display on the right side of the toolItem */
  rightContent?: React.ReactNode;

  /** whether to show the right content. If there is no right content it will show
   *  an empty space. Defaults to true. */
  showRightContent?: boolean;
}
export const InputToolItemContainer: React.FC<Props> = ({ children, name, rightContent, showRightContent = true }) => {
  return (
    <Flex width='full' alignItems='center' marginY={2}>
      <Text width={100} textAlign='right' fontSize='14px' marginRight='30px'>{name}</Text>
      <Flex flex='1 1' alignItems='center' marginRight={3}>
        {children}
      </Flex>
      {showRightContent && (
        <Flex alignItems='center' width={50} >
          {rightContent}
        </Flex>
      )}
    </Flex>
  );
};
