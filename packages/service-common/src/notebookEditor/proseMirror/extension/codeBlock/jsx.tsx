import { Box } from '@chakra-ui/react';

import { AttributeType, HTMLAttributes } from '../../attribute';
import { NodeName } from '../../node';
import { CodeBlockAttributes } from './attribute';
import { CodeBlockType } from './type';

// ********************************************************************************
// == Interface ===================================================================
export interface CodeBlockComponentRenderProps {
  visualId: string;
  attrs: Partial<CodeBlockAttributes>;
  renderAttributes: HTMLAttributes;
  children: React.ReactNode;
}

// == Component ===================================================================
export const CodeBlockComponentJSX: React.FC<CodeBlockComponentRenderProps> = ({ attrs, renderAttributes, children, visualId }) => {
  const type = attrs[AttributeType.Type] ?? CodeBlockType.Code/*default*/,
  wrap = attrs[AttributeType.Wrap] ?? false/*default*/;

  // -- UI ------------------------------------------------------------------------
  return (
    <Box
      {...renderAttributes}
      data-node-type={NodeName.CODEBLOCK}
      data-visualid={visualId}

      position='relative'
      display='flex'
      alignItems='center'
      gap='10px'
      background='#EDF2F7'
      border='1px solid'
      borderColor='#CBD5E0'
      borderRadius='4px'

      whiteSpace={wrap ? 'break-spaces' : 'pre'}
    >
      <Box
        width='100%'
        overflow='auto'
        minHeight='1.5em'
        fontSize='16px'
        fontFamily={type === CodeBlockType.Code ? 'monospace' : 'inherit'}
      >
        {children}
      </Box>

      <Box
        contentEditable={false}
        position='absolute'
        top='50%'
        left='calc(100% + 8px)'
        transform='translateY(-50%)'
      >
        {visualId}
      </Box>
    </Box>
  );
};
