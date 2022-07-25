import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import * as functions from 'firebase-functions';
import next from 'next';
import { join } from 'path';

// ********************************************************************************
// Path where the Next.js app is located
// NOTE: use 'required' in order to import the nextjs config file
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextjsDistDir = join('src', require('../src/next.config.js').distDir);

const nextApp = next({ dev: false/*application will be builded before deploying it to a Cloud function*/, conf: { distDir: nextjsDistDir} });
const requestHandler = nextApp.getRequestHandler();

const server = express();
// Express is behind a proxy, setting trust proxy will trust X-Forwarded-* headers
server.set('trust proxy', 1/**/);

server.use(cors({ origin: true }));
server.use(bodyParser.json());
server.use(compression());

// Route all requests to Next.js handler
server.all('*', (req, res) => requestHandler(req, res));

// ================================================================================
// All requests redirected here through Firebase hosting will be handled by this
// Cloud Function and will be handled by Next.js serving the page requested.
export const app = functions.https.onRequest(async (req, res) => {
  await nextApp.prepare();

  try{
    await server(req, res);
  } catch(error) {
    functions.logger.error('Error handling request, reason: ', error);
  }
});
