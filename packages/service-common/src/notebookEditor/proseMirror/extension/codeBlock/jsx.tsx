import { Box } from '@chakra-ui/react';
import { useMemo } from 'react';

import { filterStyleAttributes, AttributeType, HTMLAttributes } from '../../attribute';
import { NodeName } from '../../node';
import { CodeBlockAttributes } from './attribute';
import { CodeBlockType, DATA_VISUAL_ID } from './type';

// ********************************************************************************
export type CodeBlockComponentRenderProps = Readonly<{
  visualId: string;
  attrs: Partial<CodeBlockAttributes>;
  renderAttributes: HTMLAttributes;
  children: React.ReactNode;
}>;
export const CodeBlockComponentJSX: React.FC<CodeBlockComponentRenderProps> = ({ attrs, children, visualId }) => {
  const style = useMemo(() => filterStyleAttributes(attrs), [attrs]);
  const type = attrs[AttributeType.Type] ?? CodeBlockType.Code/*default*/,
        wrap = attrs[AttributeType.Wrap] ?? false/*default*/;

  return (
    <Box
      data-visualid={visualId}

      display='flex'
      alignItems='center'
      gap='4px'
      paddingRight='4px'

      whiteSpace={wrap ? 'break-spaces' : 'pre'}
    >
      <Box
        style={style}
        data-node-type={NodeName.CODEBLOCK}

        width='100%'
        overflow='auto'
        minHeight='1.5em'

        background='#EDF2F7'
        border='1px solid'
        borderColor='#CBD5E0'
        borderRadius='4px'

        fontSize='16px'
        fontFamily={type === CodeBlockType.Code ? 'monospace' : 'inherit'}
      >
        {children}
      </Box>

      <Box
        {...{ [DATA_VISUAL_ID]:visualId }}
        contentEditable={false}
        // @ts-ignore: !important is not a valid attribute but its a valid css value
        whiteSpace='nowrap !important'/*overrides the prosemirror's white-space*/
        minWidth='64px' /*spacing for visual id -- max content equals to "0.0.0.0"*/
      >
        {visualId}
      </Box>
    </Box>
  );
};
