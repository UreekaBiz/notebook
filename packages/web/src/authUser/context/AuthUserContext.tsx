import { createContext } from 'react';

import { AuthedUserState, UserIdentifier } from '@ureeka-notebook/web-service';

// ********************************************************************************
// == Auth User ===================================================================
// the state of a specified AuthedUser:
// - if AuthUserService hasn't finished initializing then the state is `undefined`
// - if there is no AuthedUser (i.e. the user is logged out) then the context is `null`
// - if there is an AuthedUser then the context exists and it is consistent
// child properties are correctly memoized so that they are only not `===` if there
// is a change within them. Specifically, there is no difference per se between
// using this an listening to each granular AuthUserService notification
// NOTE: this is just an alias and expressed this was so that new properties can be
//       easily added (via type intersection)
export type AuthedUserContextValue = AuthedUserState | undefined/*sentinel value -- AuthUserService not initialized*/;
export type UserIdContextValue = UserIdentifier | null/*User not logged in*/ | undefined/*sentinel value -- AuthUserService not initialized*/;

export const AuthedUserContext = createContext<AuthedUserContextValue>(undefined/*initially not initialized*/);
             AuthedUserContext.displayName = 'AuthedUserContext';
export const UserIdContext = createContext<UserIdContextValue>(undefined/*initially not initialized*/);
             UserIdContext.displayName = 'UserIdContext';
