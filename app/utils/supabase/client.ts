import {createBrowserClient} from "@supabase/ssr";
import type {SupabaseClient} from "@supabase/supabase-js";

export const createClient = ({supabaseUrl, supabaseKey}: {
  supabaseUrl: SupabaseClient['supabaseUrl'],
  supabaseKey: SupabaseClient['supabaseKey']
}) => createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 14,
        path: '/',
        sameSite: 'lax',
      },
    }
);
