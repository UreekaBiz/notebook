import { ActivityState, Unsubscribe } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../../logging';
import { getEnvNumber } from '../../util/environment';
import { AbstractService } from '../../util/AbstractService';
import SessionService from './SessionService';

const log = getLogger(ServiceLogger.AUTH_USER);

// SessionService delegate for detecting idle Users and updating the server. It
// may go through multiple initialize/shutdown cycles if the connection to the
// server is lost
// REF: https://stackoverflow.com/questions/667555/how-to-detect-idle-time-in-javascript-elegantly
// ********************************************************************************
const idleTimeout = Math.min(60/*min/hr*/*60/*sec/min*/, Math.max(30/*sec*/, getEnvNumber('NEXT_PUBLIC_ACTIVITY_IDLE_TIMEOUT', 180/*default to 3min*/)))/*sec*/;

// ********************************************************************************
export default class IdleService extends AbstractService {
  // #addEventListener() types that are used to reset the timer
  protected static readonly windowEventTypes = ['load']/*T&E*/;
  protected static readonly documentEventTypes = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']/*T&E*/;

  // ==============================================================================
  protected initialized: boolean = false/*by default*/;
  public isInitialized() { return this.initialized; }

  protected readonly unsubscribes: Unsubscribe[] = []/*set in #initialize()*/;

  // ..............................................................................
  // when expired will set the ActivityState to Idle
  protected timer: ReturnType<typeof setTimeout> | undefined = undefined/*not started*/;

  // ==============================================================================
  public constructor(parentContexts: string[], protected readonly sessionService: SessionService) { super(...parentContexts); }

  // == Life-Cycle ================================================================
  // SEE: #shutdown()
  public initialize() {
    if(this.initialized) { log.error(`${this.logContext()} Idle service already initialized.`); return/*nothing more to do*/; }

    const capture = true/*report during capture*/;
    const listener = () => { this.resetIdleTimer(); };
    IdleService.windowEventTypes.forEach(type => {
      window.addEventListener(type, listener, { capture, passive: true/*does not preventDefault()*/ });
      this.unsubscribes.push(() => window.removeEventListener(type, listener))/*CHECK: why doesn't this specify capture like below?*/;
    });
    IdleService.documentEventTypes.forEach(type => {
      document.addEventListener(type, listener, { capture, passive: true/*does not preventDefault()*/ });
      this.unsubscribes.push(() => document.removeEventListener(type, listener, { capture/*-must- match that of 'add'*/ }));
    });

    this.resetIdleTimer()/*defaults to 'Active'*/;

    this.initialized = true/*by contract*/;
  }

  // SEE: #initialize()
  public shutdown() {
    if(!this.initialized) { log.debug(`${this.logContext()} Idle service already shut down (or never initialized).`); return/*nothing more to do*/; }

    // unsubscribe from event listeners first to ensure that no events are fired
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes.splice(0)/*clear by contract*/;

    this.cancelIdleTimer();

    this.initialized = false/*by contract*/;
  }

  // ==============================================================================
  protected resetIdleTimer(restart: boolean = true/*immediately restarts the timer by default*/) {
    // NOTE: SessionService debounces as needed
    this.cancelIdleTimer();
    this.sessionService.setActivityState(ActivityState.Active/*by definition*/);

    if(restart) {
      const callback = async () => this.sessionService.setActivityState(ActivityState.Idle/*by definition*/);
      this.timer = setTimeout(callback, idleTimeout * 1000/*ms/s*/);
    } /* else -- not specified to restart */
  }

  protected cancelIdleTimer() {
    if(this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined/*reset / clear*/;
  }
}
