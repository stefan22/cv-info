import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: all data/auth/AI runs in the browser via Puter.js, so there is
  // no server bundle to host. Netlify serves the prerendered index.html and the
  // client-side router handles every route.
  ssr: false,
} satisfies Config;
