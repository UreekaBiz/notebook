import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

// ********************************************************************************
interface Props extends FlexProps {
  hasNext: boolean;
  hasPrev: boolean;

  onNext: () => void;
  onPrevious: () => void;
}
export const PaginationControls: React.FC<Props> = ({ hasNext, hasPrev, onNext, onPrevious, ...props }) => {

  return (
    <Flex width='min-content' {...props} >
      <Button
        size='xs'
        variant='ghost'
        color='#999'
        disabled={!hasPrev}
        onClick={onPrevious}
      >
        <MdKeyboardArrowLeft />
        <Text fontSize={12} fontWeight='700'>Prev</Text>
      </Button>
      <Button
        size='xs'
        variant='ghost'
        disabled={!hasNext}
        color='#999'
        onClick={onNext}
      >
        <Text fontSize={12} fontWeight='700'>Next</Text>
        <MdKeyboardArrowRight />
      </Button>
    </Flex>
  );
};
