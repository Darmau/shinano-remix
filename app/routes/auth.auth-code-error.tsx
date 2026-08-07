import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/auth.auth-code-error";
import ConfirmText from "~/locales/confirm";
import getLanguageLabel from "~/utils/getLanguageLabel";

const SUPPORTED_LANGS = ["zh", "en", "jp"] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function deriveLang(input?: string | null): SupportedLang {
  if (!input) {
    return "zh";
  }
  try {
    const url = new URL(input, "http://placeholder");
    const segments = url.pathname.split("/").filter(Boolean);
    const candidate = segments[0];
    if (candidate && SUPPORTED_LANGS.includes(candidate as SupportedLang)) {
      return candidate as SupportedLang;
    }
  } catch {
    const segments = input.split("/").filter(Boolean);
    const candidate = segments[0];
    if (candidate && SUPPORTED_LANGS.includes(candidate as SupportedLang)) {
      return candidate as SupportedLang;
    }
  }
  return "zh";
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";
  const reason = url.searchParams.get("reason") ?? "unknown";
  const providedLang = url.searchParams.get("lang");
  const lang = providedLang && ["zh", "en", "jp"].includes(providedLang)
      ? (providedLang as SupportedLang)
      : deriveLang(next);
  return { next, reason, lang };
}

export default function AuthCodeError() {
  const { reason, lang } = useLoaderData<typeof loader>();
  const labels = getLanguageLabel(ConfirmText, lang);
  const loginPath = `/${lang}/login`;

  return (
      <div className="min-h-screen bg-zinc-50 flex flex-col justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-md bg-white p-10 shadow sm:rounded-lg">
          <h1 className="text-2xl font-semibold text-zinc-900 text-center">{labels.title}</h1>
          <p className="mt-4 text-sm text-zinc-600 text-center">{labels.invalid}</p>
          {reason !== "unknown" ? (
              <p className="mt-2 text-xs text-zinc-400 text-center break-words">
                {reason}
              </p>
          ) : null}
          <div className="mt-8 space-y-3">
            <Link
                to={loginPath}
                className="block w-full text-center rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              {labels.back_to_login}
            </Link>
          </div>
        </div>
      </div>
  );
}

