import { Text } from '@chakra-ui/react';

import { filterStyleAttributes, HTMLAttributes } from '../../attribute';
import { NodeName } from '../../node';
import { CodeBlockReferenceAttributes, computeCodeBlockReferenceText } from './attribute';

// ********************************************************************************
export type CodeBlockReferenceComponentRenderProps = {
  attrs: Partial<CodeBlockReferenceAttributes>;
  renderAttributes: HTMLAttributes;

  visualId: string;

  onClick: (event: MouseEvent) => void;
}

export const CodeBlockReferenceComponentJSX: React.FC<CodeBlockReferenceComponentRenderProps> = ({ attrs, visualId, onClick }) => {
  const text = computeCodeBlockReferenceText(attrs, visualId);

  return (
    <Text
      color='red'
      as='span'
      style={filterStyleAttributes(attrs)}
      data-node-type={NodeName.CODEBLOCK_REFERENCE}
      position='relative'
      fontWeight='bold'
      // color='inherit'
      textDecoration='inherit'

      /** FIXME: How to allow handlers to execute when the component is rendered
       *         as static markup? */
      onClick={onClick}
    >
      {text}
    </Text>
  );
};