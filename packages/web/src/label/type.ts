import { LabelVisibility } from '@ureeka-notebook/service-common';

// ********************************************************************************
export const ReadableLabelVisibility: Record<LabelVisibility, string> = {
  [LabelVisibility.Private]: 'Private',
  [LabelVisibility.Public]: 'Public',
};
export const getReadableLabelVisibility = (visibility: LabelVisibility) => ReadableLabelVisibility[visibility];
