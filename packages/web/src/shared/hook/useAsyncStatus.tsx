import { useState } from 'react';

// ********************************************************************************
export type AsyncStatus = 'idle' | 'loading' | 'complete' | 'error';

// hook that manages the status of a async request. By default the status is `idle`.
export const useAsyncStatus = () => useState<AsyncStatus>('idle'/*by contract*/);
