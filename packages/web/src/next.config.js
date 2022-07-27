/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: enabling strict mode in react 18 causes the app to always mount and
  //       unmount twice causing the services to shutdown when not intended.
  // SEE:  https://github.com/vercel/next.js/issues/35822
  reactStrictMode: false,
  distDir: '../dist/.next',
}

module.exports = nextConfig;
