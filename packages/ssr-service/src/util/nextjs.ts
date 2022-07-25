import { logger } from 'firebase-functions';
import { IncomingMessage } from 'http';
import { GetServerSideProps, GetServerSidePropsContext, PreviewData, Redirect } from 'next';
import { AnySchema, ValidationError } from 'yup';

// FIXME: ApplicationError must be defined within the package!!!
import { ApplicationError, HttpStatusCode, UserIdentifier } from '@ureeka-notebook/service-common';

import { validateFirebaseIdToken } from './auth';
import { coreRoutes } from './routes';

// ********************************************************************************
// replica of request data used in next
export type NextHttpRequest = IncomingMessage & {
  cookies: Record<string, string>;
};

export type ServerSideProps = Record<string, any>;
export type QueryParams = Record<string, any>;

export type GetServerSidePropsResult<P extends ServerSideProps> =
  | { props: P; }
  | { redirect: Redirect; }
  | { notFound: true; };

export type GetServerSidePropsHandler<
  P extends ServerSideProps,
  Q extends QueryParams,
  D extends PreviewData
> = (
  context: GetServerSidePropsContext<Q, D>,
  userId: UserIdentifier | null/*not auth'ed*/,
) => Promise<GetServerSidePropsResult<P>>;

// --------------------------------------------------------------------------------
export enum ServerSideAuthAction {
  /** returns a {@link Redirect} object with the given authedRedirectURL /
   *  unauthedRedirectURL based on the state of the auth user trying to access the URL. */
  Redirect = 'redirect',

  /** loads the page */
  Load = 'load',

  /** Logout the user. This is essentially a #Redirect} to the logout page. */
  Logout = 'logout',
}

type GetServerSidePropsOptions<SchemaType extends Record<string, any>> = Readonly<{
  /** is auth required? if false, #authedAction} and authedAction actions will be
   *  ignored, otherwise the corresponding #ServerSideAuthAction} will be performed
   *  based on the auth state of the caller. */
  requiresAuth?: boolean;

  /** action called when caller is authed. Defaults to #ServerSideAuthAction.Load */
  authedAction?: ServerSideAuthAction;
  /** action called when caller is not authed. Defaults to #ServerSideAuthAction.Load */
  unauthedAction?: ServerSideAuthAction;

  /** URL to redirect when the caller is authed and #Redirect is performed. Defaults
   *  to #codeRoutes.root */
  authedRedirectURL?: string;
  /** URL to redirect when the caller is not authed and #Redirect} is performed,
   *  Defaults to #coreRoutes.login */
  unauthedRedirectURL?: string;

  /** the schema that the params data must validate against */
  schema?: AnySchema<SchemaType>;
}>;

// == Process Options =============================================================
// processes the options given by #wrapGetServerSideProps(). A redirect will be
// written as needed and the response will be ended preventing any other write
// action.
const processOptions = <Q extends QueryParams = QueryParams>(
  { requiresAuth, authedAction = ServerSideAuthAction.Load, authedRedirectURL = coreRoutes.root, unauthedAction = ServerSideAuthAction.Load, unauthedRedirectURL = coreRoutes.login, schema }: GetServerSidePropsOptions<Q>,
  context: GetServerSidePropsContext<Q>,
  userId: UserIdentifier | null/*not auth'ed*/
) => {
  const { res, params } = context;
  if(schema) { /*validate the params*/
    try {
      validateData(params, schema)/*throws and logs on error*/;
    } catch(error) {
      // redirect User and end response to prevent any other write action
      res.writeHead(HttpStatusCode.Found, { Location: coreRoutes.root }).end();
    }
  } /* else -- no schema to validate against */

// logger.log(userId);
  if(!requiresAuth) return/*nothing else to process*/;
  if(userId) { /*caller is auth'ed*/
    switch(authedAction) {
      case ServerSideAuthAction.Redirect:
        return res.writeHead(HttpStatusCode.Found, { Location: authedRedirectURL }).end();

      case ServerSideAuthAction.Logout:
        return res.writeHead(HttpStatusCode.Found, { Location: coreRoutes.logout }).end();

      case ServerSideAuthAction.Load:
        return/*nothing to do*/;
    }
  } else { /*caller is not auth'ed*/
    switch(unauthedAction) {
      case ServerSideAuthAction.Redirect:
        return res.writeHead(HttpStatusCode.Found, { Location: unauthedRedirectURL }).end();

      case ServerSideAuthAction.Load:
      case ServerSideAuthAction.Logout:
        return/*nothing to do*/;
    }
  }
};

// == Schema Validation ===========================================================
// FIXME: this is a copy from `cloud-functions` without DOCUMENTING IT AS SUCH!!!
//        Move to `service-common` so it is shared!!!
const validateData = (data: any, schema: AnySchema<any>) => {
  try {
    schema.validateSync(data, {
      abortEarly: false/*report all errors*/,
      strict: false/*true prevents ISO dates from being passed as strings to date()*/,
      stripUnknown: false/*don't strip -- meaning fail on unknown parameters*/,
    });
  } catch(error) {
    let message = `Context params failed schema check.`;
    if(error instanceof ValidationError) {
      if(error.errors.length > 0) message += ` Validation errors: ` + error.errors.map(error => `"${error}"`);
      logger.error(message);
    } else {/*something other than ValidationError*/
      if(error instanceof Error) message += `Reason: ${error.message}`;
      else message += `Reason: ${error}`;
      logger.error(message,
                    `\n\tReceived: `, JSON.stringify(data),
                    `\n\tWanted: `, JSON.stringify(schema.describe()));
    }
    throw new ApplicationError('functions/invalid-argument', message);
  }
};

// == Wrappers ====================================================================
export const wrapGetServerSideProps = <
  P extends ServerSideProps = ServerSideProps,
  Q extends QueryParams = QueryParams,
  D extends PreviewData = PreviewData
>(opts: GetServerSidePropsOptions<QueryParams>, handler: GetServerSidePropsHandler<P, Q, D>): GetServerSideProps<P, Q, D> => {
  return async (context) => {
    const userId = await validateFirebaseIdToken(context.req)/*logs on error*/;

    // process the options and perform the actions needed based on the auth state
    // of the caller. It will redirect to the corresponding page when needed.
    processOptions<QueryParams>(opts, context, userId);

    // FIXME: why isn't this `await`'ed? Does the caller have the try-catch? If
    //        so, that needs to be documented AND all callers need to implement it!
    return handler(context, userId);
  };
};

// == Util ========================================================================
// parses the given object into a valid JSON serializable data. This is needed when
// returning data from #getServerSideProps() since it requires a JSON serializable
// object
// FIXME: this throws an error if the data is not JSON serializable. Who should
//        handle that?!? Shouldn't it be a function of #wrapGetServerSideProps()
//        to hide all of this complexity away from the developer?
export const json = <T extends Record<string, any>>(data: T) => JSON.parse(JSON.stringify(data)) as T;
