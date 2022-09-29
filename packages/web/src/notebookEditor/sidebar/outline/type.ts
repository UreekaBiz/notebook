import { HeadingLevel, NodeIdentifier } from '@ureeka-notebook/web-service';

// ********************************************************************************
/** a representation of a heading in the outline  */
export type OutlineItem = {
  /** the Id of the {@link HeadingNode} */
  id: NodeIdentifier | undefined/*not present*/;
  /** the text content */
  label: string;
  level: HeadingLevel | undefined/*not present*/;

  /** a 0-based indicator on how much the Item is indented */
  indentation: number;
}
export type Outline = OutlineItem[];
