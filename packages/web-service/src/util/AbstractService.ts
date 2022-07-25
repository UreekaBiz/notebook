import { generateShortUuid } from '@ureeka-notebook/service-common';

// because React can rapidly startup and shutdown a service, there are many cases
// where (due to async calls) a startup - shutdown - startup cycle happens while
// an async call is still in progress. This provides a unique context that can be
// logged for forensics
// ********************************************************************************
export abstract class AbstractService {
  protected readonly instanceId = generateShortUuid();
  protected readonly parentContexts: string[];

  // == Construction ==============================================================
  protected constructor(...parentContexts: string[]) {
    parentContexts.push(this.instanceId);
    this.parentContexts = parentContexts;
  }

  // == Logging ===================================================================
  protected logContext() {
    return `[${this.parentContexts.join(',')}]`;
  }
}
