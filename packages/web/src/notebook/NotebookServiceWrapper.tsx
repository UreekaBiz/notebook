import { ReactNode } from 'react';

import { isClientSide, NotebookService } from '@ureeka-notebook/web-service';

// ********************************************************************************
interface Props { children: ReactNode; }
export const NotebookServiceWrapper: React.FC<Props> = ({ children }) => {
  // Initializes NotebookService on mount once and only once.
  // This is needed to do this way instead of using useEffect since NotebookService
  // is used by pages that requires to render its content on the first Render
  // without having any kind of loading screen.
  // Ideally this would be inside a useEffect but since React don't provide an
  // explicit order in which the useEffects are within the tree this must be done
  // instead.
  // NOTE: This is only mean to be run on the client side.
  if(isClientSide() && !NotebookService.getInstance()/*not initialized*/) NotebookService.create();

  return <>{children}</>;
};
