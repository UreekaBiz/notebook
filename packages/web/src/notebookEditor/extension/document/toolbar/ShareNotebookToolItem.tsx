import { ShareNotebookDialog } from 'notebookEditor/component/ShareNotebookDialog';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const ShareNotebookToolItem: React.FC<Props> = ({ editor }) => {
  // == State =====================================================================

  return <ShareNotebookDialog />;
};
