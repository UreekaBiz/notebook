import Link from 'next/link';

import { WrappedPage } from 'core/wrapper';
import { coreRoutes } from 'shared/routes';

// ********************************************************************************
// NOTE: this page is using Static Site Generation. See pages/README.md
// == Client Side =================================================================
function IndexPage() {
  return (
    <div>
      Hero page!!!
      Click <Link href={coreRoutes.notebook}><a>here</a></Link> to go to Notebook List page 🤖
    </div>
  );
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = IndexPage;
      Page.wrappers = [/*no wrappers*/];

export default Page;
