import { Box } from '@chakra-ui/react';

import { filterStyleAttributes, HTMLAttributes } from '../../attribute';
import { NodeName } from '../../node';
import { Demo2AsyncNodeAttributes } from './attribute';

export type Demo2AsyncNodeComponentRenderProps = {
  attrs: Partial<Demo2AsyncNodeAttributes>;
  renderAttributes: HTMLAttributes;
  children: React.ReactNode;

  performingAsyncOperation?: boolean;
}

export const Demo2AsyncNodeComponentJSX: React.FC<Demo2AsyncNodeComponentRenderProps> = ({ attrs, performingAsyncOperation, renderAttributes, children }) => {
  return (
    <Box
      style={filterStyleAttributes(attrs)}
      data-node-type={NodeName.DEMO_2_ASYNC_NODE}
      background={performingAsyncOperation ? 'rgba(0,0,0,0.3)': 'rgba(0,0,0,0.1)'}
      borderRadius='4px'
    >
      <Box whiteSpace='pre-wrap'>
        {children}
      </Box>
    </Box>
  );
};
