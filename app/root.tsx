import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';

import './app.css';

import MainNavbar from '~/components/MainNavbar';
import { usePuterStore } from '~/lib/puter';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { init } = usePuterStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, interactive-widget=overlays-content"
        />
        <Meta />
        <title>Cake®Stack</title>
        <Links />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function r(n){if(n.nodeType!==1)return;var e=n;if(e.tagName==="USAGE-LIMIT-DIALOG"){e.remove();return}e.querySelectorAll&&e.querySelectorAll("usage-limit-dialog").forEach(function(t){t.remove()})}function s(){if(!document.body)return;r(document.body);new MutationObserver(function(n){n.forEach(function(e){e.addedNodes.forEach(r)})}).observe(document.body,{childList:!0,subtree:!0})}document.body?s():document.addEventListener("DOMContentLoaded",s,{once:!0})})();`,
          }}
        />
        <script src="https://js.puter.com/v2/"></script>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="flex min-h-svh flex-col bg-white sm:min-h-dvh">
      <MainNavbar />
      <div className="relative flex flex-1 flex-col bg-[url('/images/bg.png')] bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white via-white/70 to-transparent"
        />
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ?
        'The requested page could not be found.'
      : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
