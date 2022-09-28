import { ReactNode } from 'react';

import { isClientSide, AssetService } from '@ureeka-notebook/web-service';

// ********************************************************************************
interface Props { children: ReactNode; }
export const AssetServiceWrapper: React.FC<Props> = ({ children }) => {
  // Initializes the AssetService on mount once and only once.
  // This must be done this way instead of using useEffect since the AssetService
  // is used by pages that require rendering their content on the first Render
  // without having any kind of loading screen.
  // Ideally this would be inside an useEffect but since React does not provide
  // a way to set the explicit order in which the useEffects are run within
  // the tree this must be done instead.
  // NOTE: This is only meant to be run on the client side.
  if(isClientSide() && !AssetService.getInstance()/*not initialized*/) AssetService.create();

  return <>{children}</>;
};
