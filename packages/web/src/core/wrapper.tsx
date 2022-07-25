import { NextPage } from 'next';
import { FC, ReactNode } from 'react';

// ********************************************************************************
type Wrapper = FC<{ children: ReactNode/*requires children*/; }>;
export type WrappedPage<P = {}> = NextPage<P> & {
  /** wrappers are React Functional Components that are applied in a nested manner
   *  from outer to inner. A page don't require to have wrappers to work, leaving
   *  this property as undefined is the sames as an empty array. */
  wrappers?: Wrapper[];
};

// ================================================================================
/**
 * Gets an array of React Functional components ({@link Wrapper}s) that wrap the
 * given page. The first element of the array will be the root (i.e. the outer-most
 * wrapper), followed by the second element and so on. The Page element is the last
 * child after all wrappers are resolved.
 *
 * This maintains the references of the React tree elements between page changes
 * using NextJS pages in order to prevent unnecessary re-renders and state loss.
 * This is accomplished using React reconciliation algorithms:
 * Ref: https://reactjs.org/docs/reconciliation.html
 *
 * Example: getPageWrapper([AuthServiceWrapper, NotebookServiceWrapper], PageComponent)
 *          Results in:
 *          <AuthServiceWrapper>
 *            <NotebookServiceWrapper>
 *              <PageComponent/>
 *            </NotebookServiceWrapper>
 *          <AuthServiceWrapper/>
 *
 * @param wrappers an array of wrappers that wrap the given page. The order of the
 *        wrappers defines the order in which the page is wrapped which must be
 *        carefully considered.
 * @param page a {@link ReactNode}
 * @returns a {@link ReactNode}
 */
// NOTE: uses recursion in order to generate the React Tree with the given params
export const getPageWrapper = (wrappers: Wrapper[], page: ReactNode): ReactNode => {
  if(wrappers.length < 1/*end condition -- stop recursion*/) return page;

  const WrapperNode = wrappers[0/*first element*/];
  const otherWrappers = wrappers.slice(1/*everything else*/);

  return (<WrapperNode>{/*recursive call*/getPageWrapper(otherWrappers, page)}</WrapperNode>);
};
