import { isNotebookCreator } from '@ureeka-notebook/web-service';

import { useValidatedAuthedUser } from 'authUser/hook/useValidatedAuthedUser';
import { AddToCollectionDialog } from 'label/component/AddToCollectionDialog';
import { useNotebook } from 'notebook/hook/useNotebook';
import { EditorToolComponentProps } from 'notebookEditor/toolbar/type';

// ********************************************************************************
interface Props extends EditorToolComponentProps {/*no additional*/}
export const AddToCollectionToolItem: React.FC<Props> = () => {
  const { authedUser: { userId } } = useValidatedAuthedUser();
  const { notebook, notebookId } = useNotebook();

  // only the creator of the notebook can add the notebook to a collection
  if(!isNotebookCreator(userId, notebook)) return null;/*nothing to render*/

  return <AddToCollectionDialog notebook={notebook} notebookId={notebookId} />;
};
