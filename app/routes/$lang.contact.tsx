import Subnav from "~/components/Subnav";
import { json } from "@remix-run/cloudflare";
import {Form, useActionData, useLoaderData, Link, useOutletContext} from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ContactText from "~/locales/contact";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request, context);
  const { data: { session } } = await supabase.auth.getSession();
  return json({
    session
  });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { supabase } = createClient(request, context);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return json({ error: "未登录用户无法提交信息", success: null }, { status: 401 });
  }

  const formData = await request.formData();
  const contactType = formData.get("contact_type");
  const contact = formData.get("contact");
  const message = formData.get("message");

  console.log(session.user.id)

  // 去public.users表中查找当前用户的id
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, user_id, name')
    .eq('user_id', session.user.id)
    .single();

  console.log(user)

  if (userError) {
    return json({ error: userError.message, success: null }, { status: 500 });
  }

  const { error } = await supabase
  .from("message")
  .insert({
    user_id: user.id,
    name: user.name,
    contact_type: contactType,
    contact_detail: contact,
    message
  } as MessageInsert);

  if (error) {
    return json({ error: error.message, success: null }, { status: 500 });
  }

  return json({ success: "信息提交成功", error: null });
};

export default function Contact() {
  const { session } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(ContactText, lang);

  return (
      <>
        <Subnav active="about" />
        <div className = "max-w-md mx-auto my-8 lg:my-12">
          <header className = "text-center space-y-4">
            <h2 className = "font-medium text-sm text-violet-700">{label.contact_us}</h2>
            <h1 className = "font-medium text-3xl text-zinc-700">{label.get_in_touch}</h1>
            <p className = "text-zinc-500">{label.description}</p>
          </header>
          <Form method = "post" className = "space-y-6">
            <div className = "mb-4">
              <label htmlFor = "contact_type" className = "block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label.contact_type}
              </label>
              <select
                  id = "contact_type"
                  name = "contact_type"
                  className = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                  required
                  disabled = {!session}
              >
                <option value = "email">Email</option>
                <option value = "telegram">Telegram</option>
                <option value = "wechat">WeChat</option>
                <option value = "line">Line</option>
              </select>
            </div>
            <div className = "mb-4">
              <label htmlFor = "contact" className = "block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label.contact}
              </label>
              <input
                  id = "contact"
                  name = "contact"
                  type = "text"
                  className = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                  required
                  disabled = {!session}
              />
            </div>
            <div className = "mb-4">
              <label htmlFor = "message" className = "block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label.message}
              </label>
              <textarea
                  id = "message"
                  name = "message"
                  rows = {4}
                  className = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50"
                  required
                  disabled = {!session}
              />
            </div>
            {session ? (
                <button
                    type = "submit"
                    className = "flex w-full justify-center rounded-md bg-violet-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                >
                  {label.submit}
                </button>
            ) : (
                <div className = "flex justify-between">
                  <p className = "text-red-400 text-sm">{label.require_login}</p>
                  <div className = "space-x-4">
                    <Link
                        to = {`/${lang}/login`}
                        className = "text-violet-700 font-medium"
                    >{label.login}</Link>
                    <Link
                        to = {`/${lang}/signup`}
                        className = "bg-violet-600 px-3 py-2 rounded text-white font-medium"
                    >{label.signup}</Link>
                  </div>
                </div>
            )}
          </Form>
          {actionData?.error && (
              <p className = "mt-4 text-red-500">{actionData.error}</p>
          )}
          {actionData?.success && (
              <p className="mt-4 text-green-500">{actionData.success}</p>
          )}
        </div>
      </>
  );
}

type MessageInsert = {
  user_id: number;
  name: string;
  contact_type: string;
  contact_detail: string;
  message: string;
};
