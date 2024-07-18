import {createServerClient, parseCookieHeader, serializeCookieHeader} from '@supabase/ssr';
import {AppLoadContext} from "@remix-run/cloudflare";

export function createClient(request: Request, context: AppLoadContext) {
  const headers = new Headers();

  const supabase = createServerClient(
      context.cloudflare.env.SUPABASE_URL!,
      context.cloudflare.env.SUPABASE_ANON_KEY!,
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
