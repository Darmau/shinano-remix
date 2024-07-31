import Subnav from "~/components/Subnav";
import { json, redirect } from "@remix-run/cloudflare";
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
    return json({ error: "未登录用户无法提交信息" }, { status: 401 });
  }

  const formData = await request.formData();
  const message = formData.get("message");

  if (typeof message !== "string" || message.length === 0) {
    return json({ error: "请输入有效的信息" }, { status: 400 });
  }

  const { data, error } = await supabase
  .from("message")
  .insert([{ message, user_id: session.user.id }]);

  if (error) {
    return json({ error: "提交信息失败" }, { status: 500 });
  }

  return redirect("/contact?success=true");
};

export default function Contact() {
  const { session } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(ContactText, lang);

  return (
      <>
        <Subnav active="about" />
        <div className = "max-w-md mx-auto my-8">
          <header className = "text-center space-y-4">
            <h2 className = "font-medium text-sm text-violet-700">{label.contact_us}</h2>
            <h1 className = "font-medium text-3xl text-zinc-700">{label.get_in_touch}</h1>
            <p className = "text-zinc-500">{label.description}</p>
          </header>
          <Form method = "post" className = "space-y-6">
            <div>
              <label htmlFor = "name" className = "block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label.name}
              </label>
              <input
                  id = "name"
                  name = "name"
                  type = "text"
                  className = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                  required
                  disabled = {!session}
              />
            </div>
            <div className = "mb-4">
              <label htmlFor = "contact_type" className = "block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label.contact_type}
              </label>
              <select
                  id = "contact_type"
                  name = "contact_type"
                  className = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
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
                  className = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
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
                  className = "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-50"
                  required
                  disabled = {!session}
              />
            </div>
            {session ? (
                <button
                    type = "submit"
                    className = ""
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
        </div>
      </>
  );
}
