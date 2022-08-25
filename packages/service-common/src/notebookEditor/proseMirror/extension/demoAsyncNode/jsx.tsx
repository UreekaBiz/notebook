import { Box, Text, Tooltip } from '@chakra-ui/react';

import { AttributeType, filterStyleAttributes, HTMLAttributes } from '../../attribute';
import { NodeName } from '../../node';
import { AsyncNodeStatus, asyncNodeStatusToColor } from '../asyncNode';
import { DemoAsyncNodeAttributes } from './attribute';

export type DemoAsyncNodeComponentRenderProps = {
  attrs: Partial<DemoAsyncNodeAttributes>;
  renderAttributes: HTMLAttributes;

  performingAsyncOperation?: boolean;
  isDirty?: boolean;
}

export const DemoAsyncNodeComponentJSX: React.FC<DemoAsyncNodeComponentRenderProps> = ({ attrs, performingAsyncOperation, isDirty, renderAttributes }) => {
  const status = performingAsyncOperation ? AsyncNodeStatus.PROCESSING
               : attrs[AttributeType.Status] ?? AsyncNodeStatus.NEVER_EXECUTED/*default value*/,
        text = attrs[AttributeType.Text] ?? ''/*default value*/;

  const statusColor = asyncNodeStatusToColor(status);

  return (
    <Text
      as='span'
      style={filterStyleAttributes(attrs)}
      data-node-type={NodeName.DEMO_2_ASYNC_NODE}
      position='relative'
      display='inline'
      marginLeft='4px'
      marginRight='4px'
      padding='4px'
      wordBreak='break-word'
      border='1px solid'
      borderColor={isDirty ? 'red' : '#CBD5E0'}
      borderRadius='4px'
      background='#EDF2F7'
    >
      <Tooltip hasArrow label={status} padding='4px' bg='#eee' color='#333'>
        {text}
      </Tooltip>
      <Box
        display='inline-block'
        width='0.75em'
        height='0.75em'
        marginLeft='0.35em'
        borderRadius='7.5px'
        backgroundColor={statusColor}
      />
    </Text>
  );
};
