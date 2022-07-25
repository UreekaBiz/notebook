import { WrappedPage } from 'core/wrapper';
import { NotFoundPage } from 'shared/pages/NotFoundPage';

// ********************************************************************************
// CHECK: why isn't this 100% server side? Specifically, how does React-Router and
//        SSR interact?
function FileNotFoundPage() {
  return <NotFoundPage />;
}

// --------------------------------------------------------------------------------
// SEE: core/wrapper.tsx for more information
const Page: WrappedPage = FileNotFoundPage;
      Page.wrappers = [/*no wrappers*/];

export default Page;
