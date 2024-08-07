import {type PlatformProxy} from "wrangler";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Env {
  BASE_URL: string;
  IMG_PREFIX: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  RESEND_KEY: string;
  RESEND_AUDIENCE_ID: string;
  MAPBOX_TOKEN: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}
