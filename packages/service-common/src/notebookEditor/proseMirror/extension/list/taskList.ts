import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { AttributesTypeFromNodeSpecAttributes } from '../../attribute';
import { NodeRendererSpec } from '../../htmlRenderer/type';
import { JSONNode, NodeName, NodeGroup, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Extension.
const TaskListAttributeSpec = {/*currently nothing*/};
export type TaskListAttributes = AttributesTypeFromNodeSpecAttributes<typeof TaskListAttributeSpec>

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const TaskListNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.TASK_LIST/*expected and guaranteed to be unique*/,

  group: `${NodeGroup.BLOCK} ${NodeGroup.LIST}`,
  content: `${NodeName.TASK_LIST_ITEM}+`,

  attrs: TaskListAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
export const TaskListNodeRendererSpec: NodeRendererSpec<TaskListAttributes> = {
  tag: 'ul',

  attributes: {/*use the default renderer on all attributes*/},
};

// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type TaskListNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: TaskListAttributes; };
export const isTaskListNode = (node: ProseMirrorNode<NotebookSchemaType>): node is TaskListNodeType => node.type.name === NodeName.TASK_LIST;

export const getTaskListNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.TASK_LIST];
export const createTaskListNode = (schema: NotebookSchemaType, attributes?: Partial<TaskListAttributes>, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getTaskListNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type TaskListJSONNodeType = JSONNode<TaskListAttributes> & { type: NodeName.TASK_LIST; };
export const isTaskListJSONNode = (node: JSONNode): node is TaskListJSONNodeType => node.type === NodeName.TASK_LIST;
