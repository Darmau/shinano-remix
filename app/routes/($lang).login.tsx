import {json, LoaderFunctionArgs} from '@remix-run/cloudflare'
import {Form, redirect, useActionData, useLoaderData} from '@remix-run/react'
import type {ActionFunctionArgs} from '@remix-run/cloudflare'
import {createSupabaseServerClient} from '~/utils/supabase.server'
import getLanguageLabel from "~/utils/getLanguageLabel";
import SignupText from "~/locales/signup";
import {CheckIcon} from "@heroicons/react/24/outline";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const lang = params.lang;
  const {supabase, headers} = createSupabaseServerClient(request);
  const {data: {user}} = await supabase.auth.getUser();

  if (user) {
    return redirect('/', {headers});
  }

  const origin = new URL(request.url);
  return json({lang, origin}, {headers});
};

export const action = async ({request}: ActionFunctionArgs) => {
  const {supabase, headers} = createSupabaseServerClient(request);
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const origin = formData.get('origin') as string;

  const {error} = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    return json({status: 'error', message: error.message}, {status: 400, headers});
  }

  return json({status: 'success', message: 'Email sended'}, {headers});
}

const SignIn = () => {
  const actionData = useActionData<typeof action>();

  return (
      <main className = "flex justify-center items-center bg-zinc-50">
        {actionData?.status === 'success' ? (
            <EmailSended/>
        ) : (
            <SignInForm/>
        )}
        {actionData?.status === 'error' && <p className = "error">{actionData.message}</p>}
      </main>
  );
}

const SignInForm = () => {
  const {lang, origin} = useLoaderData<typeof loader>();
  const label = getLanguageLabel(SignupText, lang!);

  return (
      <div className = "flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className = "sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className = "mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {label.title}
          </h2>
        </div>

        <div className = "mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className = "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <Form method = "POST" className = "space-y-6">

              <div>
                <label htmlFor = "email" className = "block text-sm font-medium leading-6 text-gray-900">
                  {label.email}
                </label>
                <div className = "mt-2">
                  <input
                      id = "email"
                      name = "email"
                      type = "email"
                      required
                      autoComplete = "email"
                      className = "block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <input type = "hidden" name = "origin" value = {origin}/>

              <div>
                <button
                    type = "submit"
                    className = "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {label.submit}
                </button>
              </div>
            </Form>

          </div>
        </div>
      </div>
  )
}

const EmailSended = () => {
  const {lang} = useLoaderData<typeof loader>();
  const label = getLanguageLabel(SignupText, lang!);

  return (
      <div
          className="my-24"
      >
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckIcon aria-hidden="true" className="h-6 w-6 text-green-600" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              {label.email_sent}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {label.email_check}
              </p>
            </div>
          </div>
        </div>

      </div>
  )
}

export default SignIn
