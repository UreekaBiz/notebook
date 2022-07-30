import { useNotebookEditor } from 'notebookEditor/hook/useNotebookEditor';
import { Loading } from 'shared/component/Loading';

// ********************************************************************************
interface Props { children: React.ReactNode; }
export const EditorValidator: React.FC<Props> = ({ children }) => {
  const { editor } = useNotebookEditor();
  if(!editor) return <Loading />/*not initialized yet*/;

  return <>{ children }</>;
};
