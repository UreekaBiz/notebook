import { ReactNode } from 'react';

import { UserProfileService } from '@ureeka-notebook/web-service';

// ********************************************************************************
interface Props { children: ReactNode; }
export const UserProfileServiceWrapper: React.FC<Props> = ({ children }) => {
  // Initializes UserProfileService on mount once and only once.
  // This is needed to do this way instead of using useEffect since UserProfileService
  // is used by pages that requires to render its content on the first Render
  // without having any kind of loading screen.
  // Ideally this would be inside a useEffect but since React don't provide an
  // explicit order in which the useEffects are within the tree this must be done
  // instead.
  if(!UserProfileService.getInstance()/*not initialized*/) UserProfileService.create();

  return <>{children}</>;
};
