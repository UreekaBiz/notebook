import { useNotebook } from 'notebook/hook/useNotebook';
import { ShareNotebookDialog } from 'notebookEditor/component/ShareNotebookDialog';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const ShareNotebookToolItem: React.FC<Props> = () => {
  const { notebook, notebookId } = useNotebook();

  return <ShareNotebookDialog notebook={notebook} notebookId={notebookId} />;
};
