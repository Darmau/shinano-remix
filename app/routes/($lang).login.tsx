import {json, LoaderFunctionArgs} from '@remix-run/cloudflare'
import {Form, redirect, useActionData, useLoaderData} from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/cloudflare'
import { createSupabaseServerClient } from '~/utils/supabase.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const lang = params.lang;
  const { supabase, headers } = createSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return redirect('/', { headers });
  }

  const origin = new URL(request.url);
  return json({ lang, origin }, { headers });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, headers } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const lang = formData.get('lang') as string;
  const origin = formData.get('origin') as string;

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: `${origin}/${lang}/auth/confirm`,
      data: {
        name
      }
    },
  })

  if (error) {
    return json({ status: 'error', message: error.message }, { status: 400, headers });
  }

  return json({ status: 'success', message: 'Email sended' }, { headers });
}

const SignIn = () => {

  const { lang, origin } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
      <div>
        <h1>登录</h1>
        {actionData?.status === 'success' ? (
            <p>魔法链接已发送！请检查您的邮箱。</p>
        ) : (
            <Form method = "post">
              <input
                  className = "border"
                  type = "email"
                  name = "email"
                  required
              />
              <input
                  className = "border"
                  type = "text"
                  name = "name"
                  required
              />
              <input type = "hidden" name = "lang" value = {lang}/>
              <input type = "hidden" name = "origin" value = {origin}/>
              <button type = "submit">发送魔法链接</button>
            </Form>
        )}
        {actionData?.status === 'error' && <p className = "error">{actionData.message}</p>}
      </div>
  );
}
export default SignIn
