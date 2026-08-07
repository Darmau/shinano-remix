import { Form, Link, redirect, useActionData, useLoaderData, useNavigation, useOutletContext } from "react-router";
import GithubLogin from "~/components/GithubLogin";
import type { Route } from "./+types/$lang.login";
import EmailLogin from "~/components/EmailLogin";
import SignupText from '~/locales/signup'
import getLanguageLabel from "~/utils/getLanguageLabel";
import { createClient } from "~/utils/supabase/server";
import i18nLinks from "~/utils/i18nLinks";

type ActionData = {
  success: boolean;
  error: string | null;
};

function jsonWithHeaders(data: ActionData, headers: Headers, status = 200) {
  const responseHeaders = new Headers(headers);
  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders,
  });
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const lang = params.lang || "zh";
  const next = requestUrl.searchParams.get("next") ?? `/${lang}`;

  const availableLangs = ["zh", "en", "jp"];

  // 检查用户是否已登录
  const { supabase } = createClient(request, context);
  const { data: { session } } = await supabase.auth.getSession();

  // 如果已登录，重定向到目标页面或首页
  if (session?.user) {
    return redirect(next);
  }

  return {
    origin,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs,
    error: requestUrl.searchParams.get("error"),
  };
}

export const meta: Route.MetaFunction = ({ params, data }) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(SignupText, lang);
  const baseUrl = data!.baseUrl;
  const multiLangLinks = i18nLinks(baseUrl,
    lang,
    data!.availableLangs,
    "login"
  );

  return [
    { title: label.log_in_title },
    {
      name: "description",
      content: label.log_in_description,
    },
    ...multiLangLinks
  ];
};

export default function Login() {
  const { lang } = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(SignupText, lang);
  // Manual <ActionData> retained: action returns Response (with auth-cookie headers), so typeof action erases the JSON body shape.
  const actionResponse = useActionData<ActionData>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isEmailSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "email";
  const queryError = loaderData?.error === "magic_link" ? label.magic_link_error : null;
  const errorMessage = actionResponse?.error ?? queryError;

  return (
    <div className="h-full bg-zinc-50 flex flex-col justify-center py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-zinc-900">
          {label.log_in_title}
        </h2>
        <p className="mt-6 text-center text-base text-zinc-500">{label.log_in_description}</p>
        <p className="mt-2 text-center text-sm text-zinc-400">{label.magic_link_hint}</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <Form method="POST" className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {actionResponse?.success ? (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              {label.email_check}
            </div>
          ) : (
            <EmailLogin disabled={isEmailSubmitting} />
          )}

          {errorMessage && (
            <div className="mt-6">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

      <GithubLogin />
        </Form>
        <div className="mt-6 text-center text-sm text-zinc-500">
          <Link to={`/${lang}/terms-of-use`}>Terms of Use</Link>
        </div>
      </div>
    </div>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent") as string;
  const requestUrl = new URL(request.url);
  const pathLang = requestUrl.pathname.split("/").filter(Boolean)[0];
  const rawLang = (formData.get("lang") as string | null)?.trim();
  const lang = rawLang?.length ? rawLang : (pathLang?.length ? pathLang : "zh");
  const next = requestUrl.searchParams.get("next") ?? `/${lang}`;

  const { supabase, headers } = createClient(request, context);

  if (intent === 'email') {
    const email = (formData.get("email") as string | null)?.trim();
    const labels = SignupText[lang as keyof typeof SignupText] ?? SignupText.zh;

    if (!email) {
      return jsonWithHeaders({ success: false, error: labels.email_required }, headers, 400);
    }

    const emailRedirectTo = `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    // 允许所有用户（新老用户）发送 magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        shouldCreateUser: true,  // 允许新用户创建账户
      },
    });

    if (error) {
      console.error(error);
      return jsonWithHeaders({ success: false, error: error.message }, headers, 400);
    }

    return jsonWithHeaders({ success: true, error: null }, headers);
  } else if (intent === 'github') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${requestUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      console.error(error);
      return jsonWithHeaders({ success: false, error: error.message }, headers, 400);
    }

    if (data.url) {
      // In Single Fetch, headers are handled differently
      // For redirect with headers, we need to set them via headers export
      return redirect(data.url, { headers });
    }
  }

  throw new Response(`Unknown intent: ${intent}`, {
    status: 400,
    statusText: "Bad Request",
  });
}
