import {Form, redirect, useActionData} from "@remix-run/react";
import {ActionFunctionArgs, json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import GithubLogin from "~/components/GithubLogin";
import getLanguageLabel from "~/utils/getLanguageLabel";
import SignupText from "~/locales/signup";
import EmailSignup from "~/components/EmailSignup";
import {createClient} from "~/utils/supabase/server";
import {useContext} from "react";
import {Config} from "~/root";

export async function loader({request}: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;

  return json({origin});
}

export default function Signup() {
  const {lang} = useContext(Config);
  const label = getLanguageLabel(SignupText, lang);
  const actionResponse = useActionData<typeof action>()

  return (
      <div className = "bg-zinc-50">
        <div className = "flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className = "sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className = "mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-zinc-900">
              {label.sign_up_title}
            </h2>
            <p className = "mt-6 text-center text-base text-zinc-500">{label.sign_up_description}</p>
          </div>

          <div className = "mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <Form method = "POST" className = "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              {actionResponse?.success ? (
                  <p className = "text-center text-green-600">{label.email_check}</p>
              ) : (
                  <EmailSignup />
              )}

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
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const {error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username
        }
      }
    });

    if (error) {
      console.error(error);
      return json({success: false, error: error.message}, {headers});
    }

    return json({
      success: true,
      error: null,
    })
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
