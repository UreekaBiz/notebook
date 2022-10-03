import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

// ********************************************************************************
interface Props extends Omit<FlexProps, 'children'>{
  children: ReactNode;
  rightContent?: ReactNode;
}
export const SidebarSectionTitle: React.FC<Props> = ({ children, rightContent, ...props }) => {
  return (
    <Flex
      alignItems='center'
      justify='space-between'
      width='100%'
      height='40px'
      minHeight='40px'
      paddingX={4}
      backgroundColor={'#f3f3f3'}
      boxShadow='base'
      {...props}
    >
      <Text
        fontSize={15}
        fontWeight='bold'
        textTransform='capitalize'
      >
        {children}
      </Text>
      {rightContent}
    </Flex>
  );
};
