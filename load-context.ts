import type {PlatformProxy} from "wrangler";

// When using `wrangler.jsonc` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Cloudflare.Env` interface.
// We extend it here to include additional environment variables
// that may not be in the wrangler config but are used in the app.
 
interface Env extends Cloudflare.Env {
  // Additional environment variables used in the app
  RESEND_KEY?: string;
}

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}
