# Web Application (Desktop)

The (Desktop) React Web Application.

The top-level `package.json` should have all of the functions necessary to install, start and deploy the Web Application. (If there are any omissions then they should be added).

## Hosting

This application uses Server Side Rendering implemented with [Next.js](https://nextjs.org/) to render the React application, and the hosting is handled by [Firebase](https://firebase.google.com/). The Firebase hosting is configured in the firebase.json file.

Each request that comes to the Hosting will be redirected to a single Cloud Function that serves the Next.JS application and it will return the rendered HTML, after that the Client will become dynamic and interactive with the user. Each subsequent request to a different (or even the same) page will be handled by the same Cloud Function.

For more technical details see: `./function/README.md`.

## Development
The local development consists on starting the Next development server, there is no need to emulate a cloud function with the server.

To start the application run the following command:

```bash
npx env-cmd -f .env.local.<username> npm run start-web

# or
npx env-cmd -f .env.local.<username> npm run start
```

## Deployment
Deployment the Web Application in this instance means to build the application, deploy the static assets (images, fonts, etc.) to Firebase Hosting and then deploy the Cloud Function with the Next.JS application.

To deploy the application run the following commands:

```bash
npx env-cmd -f .env.local.<username> npm run build-web
npx env-cmd -f .env.local.<username> npm run deploy-web
```
