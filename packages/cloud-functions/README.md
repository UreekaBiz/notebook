# Cloud Functions

Contains code that is related to Cloud Functions

## Notes

Because Cloud Functions are packaged so that they can be deployed on a remote server, any dependencies from the root `package.json` that are needed by this package *must* be explicitly listed in this package's `package.json`. Specifically, Lerna cannot do it's magic once deployed since that zip archive knows nothing about lerna.