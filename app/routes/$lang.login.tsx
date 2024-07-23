import {Form, redirect, useActionData, useOutletContext} from "@remix-run/react";
import {ActionFunctionArgs, json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import GithubLogin from "~/components/GithubLogin";
import EmailLogin from "~/components/EmailLogin";
import SignupText from '~/locales/signup'
import getLanguageLabel from "~/utils/getLanguageLabel";
import {createClient} from "~/utils/supabase/server";

export async function loader({request}: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;

  return json({origin});
}

export default function Login() {
  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(SignupText, lang);
  const actionResponse = useActionData<typeof action>();

  return (
      <div className = "bg-zinc-50">
        <div className = "flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className = "sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className = "mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-zinc-900">
              {label.log_in_title}
            </h2>
            <p className = "mt-6 text-center text-base text-zinc-500">{label.log_in_description}</p>
          </div>

          <div className = "mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <Form method = "POST" className = "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              <EmailLogin />

              {actionResponse?.error && (
                  <div className = "mt-6">
                    <p className = "text-sm text-red-600">{actionResponse.error}</p>
                  </div>
              )}

              <GithubLogin />
            </Form>
          </div>
        </div>
      </div>
  )
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent") as string;

  const {supabase, headers} = createClient(request, context)

  if (intent === 'email') {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const lang = formData.get("lang") as string;

    const {error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      return json({success: false, error: error.message}, {headers});
    }

    return redirect(`/${lang}`, {headers})
  } else if (intent === 'github') {
    const {data, error} = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    })

    if (error) {
      console.error(error);
      return json({success: false, error: error.message}, {headers});
    }

    if (data.url) {
      return redirect(data.url, {headers});
    }
  }

  throw () => {
    return new Response(`Unknown intent: ${intent}`, {
      status: 400,
      statusText: "Bad Request",
    });
  }
}
