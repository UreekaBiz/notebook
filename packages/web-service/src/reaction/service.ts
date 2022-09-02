import { Observable } from 'rxjs';

import { Identifier, ReactionSummary_Storage, ReactionTarget, ReactionType } from '@ureeka-notebook/service-common';

import { getLogger, ServiceLogger } from '../logging';
import { reactionToggle } from './function';
import { reactionSummary$ } from './observable';

const log = getLogger(ServiceLogger.REACTION);

// ********************************************************************************
export class ReactionService {
  // == Singleton =================================================================
  private static singleton: ReactionService;
  public static create() { return (ReactionService.singleton = new ReactionService()); }
  public static getInstance() { return ReactionService.singleton; }

  // == Lifecycle =================================================================
  protected constructor() {/*nothing at this time*/}
  public shutdown() {
    log.info(`Shutting down Reaction service ...`);
  }

  // == Observable ================================================================
  // -- Reaction Summary ----------------------------------------------------------
  /**
   * @param entityId the identifier of the entity for the desired {@link ReactionSummary}
   * @returns {@link Observable} over the {@link ReactionSummary} for the specified
   *          entity. If no reactions for the entity have ever been recorded then
   *          this will still emit a {@link ReactionSummary} (it will have zero counts).
   */
  // TODO / CHECK: any (logged in) User can see *any* Entity's Reaction Summary
  //               (It's not obvious as to how to limit the RTDB's read access to
  //               the User's own Entity ids. Exposure isn't terrible since the
  //               Entity itself isn't exposed in any way.)
  public onReactionSummary$(entityId: Identifier): Observable<ReactionSummary_Storage> {
    return reactionSummary$(entityId);
  }

  // == Toggle ====================================================================
  /**
   * @param target the {@link ReactionTarget} of the Entity whose reaction is being
   *        toggled
   * @param entityId the identifier of the Entity whose reaction is to be toggled
   * @param type the {@link ReactionType} to toggle
   * @returns the resulting state (`true` if the reaction was togged on)
   * @throws a {@link ApplicationError}:
   * - `permission-denied` if the caller is not logged in or is not allowed to react
   *   to the specified Entity
   * - `invalid-argument` if the specified type or target is not valid
   * - `datastore/write` if there was an error updating the datastore
   */
  public async toggleReaction(target: ReactionTarget, entityId: Identifier, type: ReactionType): Promise<boolean> {
    const result = await reactionToggle({ target, entityId, type });
    return result.data;
  }
}
