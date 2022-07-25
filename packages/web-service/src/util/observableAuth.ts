import { Auth, User } from 'firebase/auth';
import { Observable, Unsubscribable } from 'rxjs';

import { isType } from '@ureeka-notebook/service-common';

// ********************************************************************************

// == Auth => Observable ==========================================================
export const fromAuth = (auth: Auth): Observable<User | null/*logged out*/> =>
  new Observable(subscriber => isType<Unsubscribable>({ unsubscribe: auth.onAuthStateChanged(subscriber) }));
