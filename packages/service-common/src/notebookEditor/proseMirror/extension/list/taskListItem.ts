import { Mark, Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';

import { noNodeOrMarkSpecAttributeDefaultValue, AttributesTypeFromNodeSpecAttributes, AttributeType } from '../../attribute';
import { createNodeDataAttribute, createNodeDataTypeAttribute, NodeRendererSpec } from '../../htmlRenderer/type';
import { JSONNode, NodeName, ProseMirrorNodeContent } from '../../node';
import { NotebookSchemaType } from '../../schema';

// ********************************************************************************
// == Attribute ===================================================================
// NOTE: This values must have matching types the ones defined in the Extension.
const TaskListItemAttributeSpec = {
  /** whether or not this taskListItem is checked */
  [AttributeType.Checked]: noNodeOrMarkSpecAttributeDefaultValue<boolean>(),
};
export type TaskListItemAttributes = AttributesTypeFromNodeSpecAttributes<typeof TaskListItemAttributeSpec>

// == Spec ========================================================================
// -- Node Spec -------------------------------------------------------------------
export const TaskListItemNodeSpec: Readonly<NodeSpec> = {
  name: NodeName.TASK_LIST_ITEM/*expected and guaranteed to be unique*/,

  content: `${NodeName.LIST_ITEM_CONTENT} (${NodeName.LIST_ITEM_CONTENT} | ${NodeName.BULLET_LIST} | ${NodeName.ORDERED_LIST} | ${NodeName.TASK_LIST})*`,
  defining: true,

  attrs: TaskListItemAttributeSpec,
};

// -- Render Spec -----------------------------------------------------------------
const renderTaskListItemNodeView = (attributes: TaskListItemAttributes, content: string) => {
  // CHECK: is there any reason this can't use JSX to define the structure?
  // NOTE: must not contain white space, else the renderer has issues
  //       (hence it is a single line below)
  // NOTE: createNodeDataTypeAttribute must be used for all nodeRenderSpecs
  //       that define their own renderNodeView
  return `<li ${createNodeDataTypeAttribute(NodeName.TASK_LIST_ITEM)} ${DATA_TASK_LIST_ITEM_CHECKED}="${attributes.checked ? 'true' : 'false'}"><label contenteditable="false"><input type="checkbox" ${attributes.checked ? 'checked="true"' : ''/*don't add attr if not checked*/} /></label><div>${content}</div></li>`;
};

export const TaskListItemNodeRendererSpec: NodeRendererSpec<TaskListItemAttributes> = {
  tag: 'li',

  isNodeViewRenderer: true/*by definition*/,
  renderNodeView: renderTaskListItemNodeView,

  attributes: {/*no need to render attributes*/},
};


// == Type ========================================================================
// -- Node Type -------------------------------------------------------------------
// NOTE: this is the only way since PM does not provide a way to specify the type
//       of the attributes
export type TaskListItemNodeType = ProseMirrorNode<NotebookSchemaType> & { attrs: TaskListItemAttributes; };
export const isTaskListItemNode = (node: ProseMirrorNode<NotebookSchemaType>): node is TaskListItemNodeType => node.type.name === NodeName.TASK_LIST_ITEM;

export const getTaskListItemNodeType = (schema: NotebookSchemaType) => schema.nodes[NodeName.TASK_LIST_ITEM];
export const createTaskListItemNode = (schema: NotebookSchemaType, attributes?: Partial<TaskListItemAttributes>, content?: ProseMirrorNodeContent, marks?: Mark<NotebookSchemaType>[]) =>
  getTaskListItemNodeType(schema).create(attributes, content, marks);

// -- JSON Node Type --------------------------------------------------------------
export type TaskListItemJSONNodeType = JSONNode<TaskListItemAttributes> & { type: NodeName.TASK_LIST_ITEM; };
export const isTaskListItemJSONNode = (node: JSONNode): node is TaskListItemJSONNodeType => node.type === NodeName.TASK_LIST_ITEM;

// == Constant ====================================================================
export const DATA_TASK_LIST_ITEM_CHECKED = createNodeDataAttribute(AttributeType.Checked);