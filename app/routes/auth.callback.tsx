import { redirect } from "react-router";
import type { Route } from "./+types/auth.callback";
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

const SUPPORTED_LANGS = ["zh", "en", "jp"] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function deriveLangFromPath(path: string): SupportedLang {
  const segments = path.split("/").filter(Boolean);
  const candidate = segments[0];
  if (candidate && SUPPORTED_LANGS.includes(candidate as SupportedLang)) {
    return candidate as SupportedLang;
  }
  return "zh";
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const errorDescription = requestUrl.searchParams.get("error_description") ?? undefined;
  const headers = new Headers();

  if (code) {
    const supabase = createServerClient(
        context.cloudflare.env.SUPABASE_URL,
        context.cloudflare.env.SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              const parsed = parseCookieHeader(request.headers.get("Cookie") ?? "");
              return parsed.map((cookie) => ({
                name: cookie.name,
                value: cookie.value ?? "",
              }));
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                  headers.append("Set-Cookie", serializeCookieHeader(name, value, options))
              );
            },
          },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect(next, { headers });
    }

    return redirect(
        `/auth/auth-code-error?next=${encodeURIComponent(next)}&reason=${encodeURIComponent(
            error.message ?? "exchange_failed"
        )}`,
        { headers }
    );
  }

  const lang = deriveLangFromPath(next);
  const reason =
      errorDescription ??
      requestUrl.searchParams.get("error") ??
      requestUrl.searchParams.get("message") ??
      "unknown";

  return redirect(
      `/auth/auth-code-error?next=${encodeURIComponent(next)}&reason=${encodeURIComponent(reason)}&lang=${lang}`,
      { headers }
  );
}
