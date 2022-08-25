import { AttributesTypeFromNodeSpecAttributes, AttributeType, noNodeOrMarkSpecAttributeDefaultValue } from '../../attribute';
import { createDefaultCodeBlockAsyncNodeAttributes, CodeBlockAsyncNodeAttributeSpec, DEFAULT_CODEBLOCK_ASYNC_NODE_STATUS } from '../codeBlockAsyncNode';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: must be present on the NodeSpec below
// NOTE: This values must have matching types the ones defined in the Extension
export const DemoAsyncNodeAttributeSpec = {
  ...CodeBlockAsyncNodeAttributeSpec,

  [AttributeType.Delay]: noNodeOrMarkSpecAttributeDefaultValue<number>(),
};
export type DemoAsyncNodeAttributes = AttributesTypeFromNodeSpecAttributes<typeof DemoAsyncNodeAttributeSpec>;

// == Util ========================================================================
export const createDefaultDemoAsyncNodeAttributes = (): Partial<DemoAsyncNodeAttributes> =>
  ({ ...createDefaultCodeBlockAsyncNodeAttributes(), [AttributeType.Delay]: DEFAULT_DEMO_ASYNC_NODE_DELAY });

 export const DEFAULT_DEMO_ASYNC_NODE_STATUS = DEFAULT_CODEBLOCK_ASYNC_NODE_STATUS/*alias*/;
export const DEFAULT_DEMO_ASYNC_NODE_TEXT = 'Not Executed'/*creation default*/;
export const DEFAULT_DEMO_ASYNC_NODE_DELAY = 4000/*ms*/;
