import { useMediaQuery, Box, BoxProps, Flex, IconButton } from '@chakra-ui/react';
import { useState, ReactNode } from 'react';
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';

// ********************************************************************************
const SIDEBAR_DESKTOP_MIN_WIDTH = 768/*px*/;
const SIDEBAR_DEVICE_WIDTH = 425/*px*/;
const SIDEBAR_COLOR = 'white';

// ********************************************************************************
interface Props {
  children: ReactNode;
  sidebar: ReactNode;
}
export const SideBarLayout: React.FC<Props> = ({ children, sidebar }) => {
  // == State =====================================================================
  const [isShowingSidebar, setIsShowingSidebar] = useState(true/*default show sidebar*/);
  const [isDesktop] = useMediaQuery(`(min-width:${SIDEBAR_DESKTOP_MIN_WIDTH}px)`);
  const [isTablet] = useMediaQuery(`(max-width:${SIDEBAR_DESKTOP_MIN_WIDTH}px) and (min-width:${SIDEBAR_DEVICE_WIDTH}px)`);
  const [isPhone] = useMediaQuery(`(max-width:${SIDEBAR_DEVICE_WIDTH}px)`);

  // == Handlers ==================================================================
  const toggleSidebar = () => setIsShowingSidebar(prevState => !prevState);

  // == UI ========================================================================
  const sideBarContainerProps: Partial<BoxProps> =
    isPhone
      ? { left: '100%', position: 'absolute', top: 0, width: '100vw', height: '100vw', transform:`translateX(${isShowingSidebar ? '-100%' : '0'})` }
      : { width: SIDEBAR_DEVICE_WIDTH, marginRight: isDesktop || isShowingSidebar ? 0 : -SIDEBAR_DEVICE_WIDTH, boxShadow: 'base' };

  return (
    <Flex alignItems='stretch' position='relative' width='full' height='full' overflow='hidden'>
      <Box flex='1 1' overflowY='auto'>{children}</Box>
      <Box background={SIDEBAR_COLOR} overflowY='auto' {...sideBarContainerProps} transition='all .5s'>{sidebar}</Box>

      {(isTablet || isPhone) && (
        <IconButton
          position='absolute'
          right={16}
          top={5}
          aria-label=''
          icon={isShowingSidebar ? <AiOutlineArrowRight /> : <AiOutlineArrowLeft />}
          transition='all .5s'
          onClick={toggleSidebar}
        />
      )}
    </Flex>
  );
};
