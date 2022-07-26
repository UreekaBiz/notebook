# Notebook

ProseMirror, Firebase Collaborative Editor.

[![Total alerts](https://img.shields.io/lgtm/alerts/g/UreekaBiz/notebook.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/UreekaBiz/notebook/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/UreekaBiz/notebook.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/UreekaBiz/notebook/context:javascript)

## Prerequisites
Create a copy of `.env.template` whose name is `.env.local.<user>` in the root folder. Replace all `__fillin__` entries.

Ensure the correct version of NodeJS

```bash
nvm install --latest-npm
```

Set up dependencies
```bash
npm install
npm run bootstrap
```

## Dev Environment

Typically in separate Terminals
1. Watch service-common:  `npx env-cmd -f .env.local.<user> npm run watch-service-common`
2. Watch ssr-service:     `npx env-cmd -f .env.local.<user> npm run watch-ssr-service`
3. Watch web-service:     `npx env-cmd -f .env.local.<user> npm run watch-web-service`
4. Watch (start) web:     `npx env-cmd -f .env.local.<user> npm run start-web`
5. Watch cloud-functions: `npx env-cmd -f .env.local.<user> npm run watch-functions`

There should be no errors or warning seen.
Defaults to `localhost:3000`

### Clean

```bash
npm run clean
rm -rf node_modules
rm -rf packages/service-common/dist
rm -rf packages/ssr-service/dist
rm -rf packages/web-service/dist
rm -rf packages/web/build
rm -rf packages/cloud-functions/dist
```

#### Super Clean

```bash
rm -f package-lock.json
rm -f packages/service-common/package-lock.json
rm -f packages/ssr-service/package-lock.json
rm -f packages/web-service/package-lock.json
rm -f packages/web/package-lock.json
rm -f packages/cloud-functions/package-lock.json
```

## Deploy Firebase Rules
`npx env-cmd -f .env.local.<user> npm run deploy-rules`

## Deploy Cloud Functions
`npx env-cmd -f .env.local.<user> npm run deploy-functions`

## Deploy a specific Cloud Function
`npx env-cmd -f .env.local.<user> npm run deploy-specified-functions -- --only functions: <functionName> `

## Deploy Web
```bash
npx env-cmd -f .env.local.<username> npm run build-web
npx env-cmd -f .env.local.<username> npm run deploy-web
```

## Production Environment

1. Common libs:     `npx env-cmd -f .env.prod npm run build-service`
2. Cloud Functions: `npx env-cmd -f .env.prod npm run build-functions`

[ FINISH ]

