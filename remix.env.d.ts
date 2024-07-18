import type { AppLoadContext as OriginalAppLoadContext } from "@remix-run/cloudflare";

declare module "@remix-run/server-runtime" {
  export interface AppLoadContext extends OriginalAppLoadContext {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}
