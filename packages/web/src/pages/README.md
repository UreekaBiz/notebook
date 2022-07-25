# Pages

This is a special directory managed by Next.js and as such its name is inconsistent with the non-plural-folder-names rule. Each .tsx file in this directory is rendered as a page.
For detailed information see: https://nextjs.org/docs/basic-features/pages

There special files that are not rendered as pages in their own route but rather used as templates, configuration and initialization:
  - `pages/_app.tsx`: Main application template
  - `pages/_document.tsx`: Main document template
  - `pages/_error.tsx`: Error page template.

For detailed information refer to the corresponding file.

## Development

Creating a page consists on creating a .tsx file in the `pages` directory. The default export of this file is a React component that renders the page.

The route from which a page can be accessed is the path to the file and the file name itself.
For example `user/profile` is the route to the `user/profile.tsx` file.

Dynamic pages are also supported, for example `/user/:id` is the route to the `user/[id].tsx` file (where the brackets are literal).
See: `pages/notebook/[notebookId].tsx` as an example.

Each page can use either or both Server Side Rendering and Static Site Generation.

## Server Side Rendering

A page using Server Side Rendering is rendered by the server and the result is sent to the client. A use case is to get the content for a published notebook before sending it to the client.

In order to use Server Side Rendering, the page must export a special function called `getServerSideProps` that is called **by the server** and must return a `Promise` with the props to be passed to the component. This props are used by the component to render the initial content **on the server** and then be sent to the client. After the server-side renders the content and it gets to the client, the component is managed exclusively by the client.
See: `pages/notebook/[notebookId].tsx` as an example.

## Static Site Generator

A page using Static Site Generation is rendered by Next.js in the browser and there is no need to perform operations on the server-side such as rendering the page. (FIXME: this section isn't clear. Is there something in NextJS that can be referenced to make it clearer? Perhaps an example of what it means?)
There are no extra steps for using Static Site Generator -- the "default" functionality used.
See: `pages/notebook/index.tsx` as an example.
