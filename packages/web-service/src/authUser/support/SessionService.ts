import { onDisconnect, onValue, serverTimestamp } from 'firebase/database';
import { BehaviorSubject, Observable } from 'rxjs';

import { sessionKey, ActivityState, DeleteRecord, UserSession_Write, SessionIdentifier, Unsubscribe, UserIdentifier } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../../logging';
import { getEnvNumber } from '../../util/environment';
import { AbstractService } from '../../util/AbstractService';
import { clientConnectedRef, userSessionRef } from '../datastore';
import { authUserSessionClear, authUserSessionUpdate } from '../function';
import IdleService from './IdleService';

const log = getLogger(ServiceLogger.AUTH_USER);

// FirebaseAuthService delegate that manages communication of a User's Session
// to the server
// NOTE:  due to the fact that the connection may bounce between connected and
//        disconnected, it's possible for a single Session (`sessionId`) to exist
//        across multiple disparate connect / disconnect cycles in the RTDB (i.e.
//        a Session may appear and disappear multiple times).
// REF: https://firebase.google.com/docs/firestore/solutions/presence
// REF: https://firebase.google.com/docs/database/web/offline-capabilities#section-presence
// REF: https://groups.google.com/d/msg/firebase-talk/tQcYTUXkRnQ/XZv7IMSdBgAJ
// ********************************************************************************
const updateInterval = Math.min(60/*min/hr*/*60/*sec/min*/, Math.max(30/*sec*/, getEnvNumber('NEXT_PUBLIC_SESSION_UPDATE_INTERVAL', 300/*default to 5min*/)))/*sec*/;

// ********************************************************************************
export default class SessionService extends AbstractService {
  private static DEFAULT_ACTIVITY = ActivityState.Active/*default*/;

  // ******************************************************************************
  private initialized: boolean = false/*by default*/;
  public isInitialized() { return this.initialized; }

  // ..............................................................................
  private readonly connected = new BehaviorSubject<boolean>(false/*offline by default*/);

  private activity: ActivityState = SessionService.DEFAULT_ACTIVITY;

  // ..............................................................................
  // when expired the Session timeout will be rewritten. It is driven by the RTDB's
  // connected state.
  private interval: ReturnType<typeof setInterval> | undefined = undefined/*not started*/;

  // NOTE:  if this is non-null then 'userId' and 'sessionId' are non-null by contract
  private unsubscribe: Unsubscribe | null = null/*none by default*/;

  // ..............................................................................
  private readonly idleService;

  // ==============================================================================
  // SEE: #shutdown()
  public constructor(parentContexts: string[], private readonly userId: UserIdentifier, private readonly sessionId: SessionIdentifier) {
    super(...parentContexts);

    this.idleService = new IdleService(this.parentContexts, this);

    // NOTE: unfortunately must be called first since onValue() *immediately* calls
    //       its callback (rather than on the next tick as expected!)
    this.initialized = true/*by contract*/;

    // TODO: separate out the connected / disconnected logic into a separate service
    //       so that it can be used independently of if there is a User
    // NOTE: cannot use `this.userId` or `this.sessionId` below to ensure that they
    //       are independent of any changes to the object itself before shutdown
    // NOTE: the callback handler is called immediately (which isn't necessarily expected!)
    const offlineState: UserSession_Write = { // NOTE: this is the only place where the RTDB is directly written by the client
      timestamp: serverTimestamp()/*write-always server-set*/,
      [sessionKey(sessionId)]: DeleteRecord/*clear Session-level record*/,
    };
    this.unsubscribe = onValue(clientConnectedRef, async (snapshot) => {
      this.connectionChangeCount++/*stats*/;

      const ref = userSessionRef(userId);
      if(snapshot.val() === false) { /*not online*/
        // NOTE: can't write while not connected so stop the timers
        if(this.idleService.isInitialized()) this.idleService.shutdown();
        this.cancelSessionTimer()/*done last to ensure that the IdleService had its last word*/;

        this.connected.next(false/*offline*/);

        return/*nothing else to do*/;
      } /* else -- the client is connected */

      // NOTE: writes Session first to get in the first word before the IdleService
      await this.writeSession('new / reconnected session')/*implicitly starts Session timer*/;

      if(this.initialized && !this.idleService.isInitialized()) this.idleService.initialize()/*only run while connected*/;

      this.connected.next(true/*online*/);

      // establish a server-side on-disconnect operation that will remove the
      // session-level presence in the RTDB. Also, set the current presence to
      // 'online'.
      // NOTE: because this is called as a result of being connected to the RTDB
      //       and because it's possible for a connection to flap, this may be
      //       called *multiple* *times*. Also, this implies that the same session
      //       (by a single sessionId) may be written and cleared multiple times.
      // REF: https://firebase.google.com/docs/database/web/offline-capabilities#how-ondisconnect-works
      // REF: https://firebase.google.com/docs/database/web/read-and-write
      try {
        await onDisconnect(ref).update(offlineState);
      } catch(error) {
        log.error(`${this.logContext()} Error while establishing Session. Reason: `, error);
        // CHECK: what's the best follow-up on this? Simply log-out the User?
        //        The alternative is that the User is online but there the server
        //        is unaware.
      }
    });
  }

  // NOTE: the async aspect of this can be safely ignored
  public async shutdown() {
    // because of the 'await's in this method, the initialization state is set
    // early to ensure that the async onUpdate() handler (which may be currently
    // in it's own 'await') knows as soon as possible
    if(!this.initialized) { log.debug(`${this.logContext()} Session service already shut down (or never initialized).`); return; }
    this.initialized = false/*by contract*/;

    // shutdown the is-connected listener to ensure that it can't restart the
    // dependent services
    if(this.unsubscribe !== null) this.unsubscribe();
    this.unsubscribe = null/*reset*/;

    // NOTE: this may have never started as it requires that the client is connected
    if(this.idleService.isInitialized()) this.idleService.shutdown();

    // stop the Session timer *last* in case the IdleService didn't start it
    this.cancelSessionTimer();

    // clear the Session *then* cancel the on-disconnect handler to ensure that
    // in any case the Session is cleared
    try {
      log.debug(`${this.logContext()} Clearing Session.`);
      await authUserSessionClear({ sessionId: this.sessionId! });
    } catch(error) {
      log.error(`${this.logContext()} Error while clearing the Session. Reason: `, error);
    }
    try {
      log.debug(`${this.logContext()} Disconnecting Session on-disconnect handler.`);
      const ref = userSessionRef(this.userId!);
      await onDisconnect(ref).cancel();
    } catch(error) {
      log.error(`${this.logContext()} Error while canceling session on-disconnect handler. Reason: `, error);
    }

    this.activity = SessionService.DEFAULT_ACTIVITY/*reset*/;
  }

  // == Timer =====================================================================
  private resetSessionTimer() {
    this.cancelSessionTimer()/*cancel any existing first by contract*/;

    const callback = async () => this.writeSession('timestamp');
    this.interval = setInterval(callback, updateInterval * 1000/*ms*/);
  }

  private cancelSessionTimer() {
    if(this.interval !== undefined) clearInterval(this.interval);
    this.interval = undefined/*reset / clear*/;
  }

  // == Observable ================================================================
  public get connected$(): Observable<boolean/*true for connected*/> {
    return this.connected;
  }

  // == Session ===================================================================
  // sets and writes the specified ActivityState if and only if different from the
  // current state
  public async setActivityState(activity: ActivityState) {
    if(!this.initialized) { log.debug(`${this.logContext()} Could not record activity state since Session service is already shutdown (or never initialized).`); return/*nothing more to do*/; }
    if(this.activity === activity) return/*short-circuit to limit writes*/;

    this.activity = activity/*update local state*/;
    await this.writeSession(`activity state (${activity})`);
  }

  // ------------------------------------------------------------------------------
  private async writeSession(label: string) {
    if(!this.initialized) { log.debug(`${this.logContext()} Could not write session data since Session service is already shutdown (or never initialized).`); return/*nothing more to do*/; }
    const sessionId = this.sessionId!/*for convenience*/,
          activity = this.activity/*for convenience*/;
    this.sessionWriteCount++/*stats*/;

    try {
      await authUserSessionUpdate({ sessionId, activity });
      log.debug(`${this.logContext()} Wrote ${label} to session.`);
    } catch(error) {
      log.error(`${this.logContext()} Error updating Session with ${label}. Reason: `, error);
    } finally {
      this.resetSessionTimer()/*restart the timer from this point*/;
    }
  }

  // == Logging ===================================================================
  protected logContext() { return `${super.logContext()}[User:${this.userId},Session:${this.sessionId}].`; }

  // == Stats =====================================================================
  // the number of times that the connection listener changed state
  private connectionChangeCount: number = 0;

  // the number of times that the Session was written
  private sessionWriteCount: number = 0;

  // ..............................................................................
  public stats() {
    return {
      connectionChanges: this.connectionChangeCount,
      sessionWrites: this.sessionWriteCount,
    };
  }
}
