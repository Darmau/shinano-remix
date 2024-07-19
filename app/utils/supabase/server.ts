import {createServerClient, parseCookieHeader, serializeCookieHeader} from '@supabase/ssr';
import {AppLoadContext} from "@remix-run/cloudflare";
import {Database} from "~/types/supabase";

export function createClient(request: Request, context: AppLoadContext) {
  const headers = new Headers();

  const supabase = createServerClient<Database>(
      context.cloudflare.env.SUPABASE_URL,
      context.cloudflare.env.SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return parseCookieHeader(request.headers.get('Cookie') ?? '')
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({name, value, options}) =>
                headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
            )
          },
        },
      }
  );
  return { supabase, headers }
}
