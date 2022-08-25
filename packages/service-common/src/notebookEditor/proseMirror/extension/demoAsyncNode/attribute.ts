import { AttributesTypeFromNodeSpecAttributes, AttributeType, noNodeOrMarkSpecAttributeDefaultValue } from '../../attribute';
import { CodeBlockAsyncNodeAttributeSpec, createDefaultCodeBlockAsyncNodeAttributes } from '../codeBlockAsyncNode';
import { DEFAULT_DEMO_ASYNC_NODE_DELAY } from './node';

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
