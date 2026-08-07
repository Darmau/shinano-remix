import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Form, Link, useActionData, useLoaderData, useNavigation, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.unsubscribe";
import { createClient } from "~/utils/supabase/server";
import { verifyUnsubscribeToken } from "~/utils/unsubscribeToken.server";
import getLanguageLabel from "~/utils/getLanguageLabel";
import UnsubscribeText from "~/locales/unsubscribe";
import i18nLinks from "~/utils/i18nLinks";

type LoaderData = {
  // "already"（此前已退订）需要回读 receive_notification 才能判断，
  // 而该列对 anon 已不可读，因此这个状态不再产生
  state: "error" | "ready";
  message?: string;
  token?: string;
  availableLangs: string[];
  baseUrl: string;
  lang: string;
};

type ActionData = {
  success: boolean;
  error?: string;
};

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const availableLangs = ["zh", "en", "jp"];
  const langParam = typeof params.lang === "string" ? params.lang : "zh";
  const lang = availableLangs.includes(langParam) ? langParam : "zh";
  const labels = getLanguageLabel(UnsubscribeText, lang);
  const runtimeEnv = context.cloudflare?.env ?? globalThis.process?.env ?? {};
  const baseUrl = runtimeEnv.BASE_URL ?? "";

  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return {
      state: "error",
      message: labels.error_missing_token,
      availableLangs,
      baseUrl,
      lang,
    } satisfies LoaderData;
  }

  const secret = runtimeEnv.UNSUBSCRIBE_KEY;

  if (!secret) {
    return {
      state: "error",
      message: labels.error_config,
      availableLangs,
      baseUrl,
      lang,
    } satisfies LoaderData;
  }

  const commentId = await verifyUnsubscribeToken(token, secret);

  if (!commentId) {
    return {
      state: "error",
      message: labels.error_invalid_token,
      availableLangs,
      baseUrl,
      lang,
    } satisfies LoaderData;
  }

  // 这里不再回查 comment：2026-08-07 起 anon 读不到 receive_notification 列
  // （列级 GRANT，会直接 42501），而且待审核的评论对 anon 根本不可见，
  // 查了只会把合法链接误判成“评论不存在”。token 有效即展示确认按钮，
  // 真正的幂等性交给 action 里的更新去保证。
  return {
    state: "ready",
    token,
    availableLangs,
    baseUrl,
    lang,
  } satisfies LoaderData;
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const availableLangs = ["zh", "en", "jp"];
  const langParam = typeof params.lang === "string" ? params.lang : "zh";
  const lang = availableLangs.includes(langParam) ? langParam : "zh";
  const labels = getLanguageLabel(UnsubscribeText, lang);

  const formData = await request.formData();
  const token = formData.get("token");

  if (!token || typeof token !== "string") {
    return {
      success: false,
      error: labels.error_missing_token,
    } satisfies ActionData;
  }

  const runtimeEnv = context.cloudflare?.env ?? globalThis.process?.env ?? {};
  const secret = runtimeEnv.UNSUBSCRIBE_KEY;

  if (!secret) {
    return {
      success: false,
      error: labels.error_config,
    } satisfies ActionData;
  }

  const commentId = await verifyUnsubscribeToken(token, secret);

  if (!commentId) {
    return {
      success: false,
      error: labels.error_invalid_token,
    } satisfies ActionData;
  }

  const { supabase } = createClient(request, context);
  // count 用来分辨“更新成功”和“RLS 把行挡掉了、一行都没改”——
  // 后者不报错，只返回 0 行，不检查的话会给访客一个假的成功提示。
  const { error, count } = await supabase
    .from("comment")
    .update({ receive_notification: false }, { count: "exact" })
    .eq("id", commentId);

  if (error) {
    console.error("Failed to unsubscribe comment notifications:", error);
    return {
      success: false,
      error: labels.error_generic,
    } satisfies ActionData;
  }

  if (!count) {
    console.error("Unsubscribe affected 0 rows (RLS?) for comment", commentId);
    return {
      success: false,
      error: labels.error_generic,
    } satisfies ActionData;
  }

  return {
    success: true,
  } satisfies ActionData;
}

export default function UnsubscribePage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { lang } = useOutletContext<{ lang: string }>();
  const labels = getLanguageLabel(UnsubscribeText, lang);

  const isSubmitting = navigation.state === "submitting";
  const submissionSuccess = actionData?.success === true;

  if (loaderData.state === "error") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center mb-4">
            <XCircleIcon className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 text-center mb-4">
            {labels.error_title}
          </h1>
          <p className="text-zinc-600 text-center">
            {loaderData.message ?? labels.error_generic}
          </p>
        </div>
      </div>
    );
  }

  if (submissionSuccess) {
    const title = labels.success_title;
    const description = labels.success_description;

    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 text-center mb-4">
            {title}
          </h1>
          <p className="text-zinc-600 text-center mb-6">{description}</p>
          <Link
            to={`/${lang}`}
            className="w-full inline-flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {labels.home_button}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 text-center mb-4">
          {labels.confirm_title}
        </h1>
        <p className="text-zinc-600 text-center mb-8">
          {labels.confirm_description}
        </p>

        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{actionData.error}</p>
          </div>
        )}

        <Form method="post" replace>
          <input type="hidden" name="token" value={loaderData.token || ""} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? labels.pending : labels.confirm_button}
          </button>
        </Form>
      </div>
    </div>
  );
}

export const meta: Route.MetaFunction = ({ params, data }) => {
  if (!data) {
    return [];
  }

  const langParam =
    typeof params.lang === "string" ? params.lang : data.lang ?? "zh";
  const lang = data.availableLangs.includes(langParam) ? langParam : data.lang;
  const labels = getLanguageLabel(UnsubscribeText, lang);
  const baseUrl = data.baseUrl ?? "";
  const links = baseUrl
    ? i18nLinks(baseUrl, lang, data.availableLangs, "unsubscribe")
    : [];

  const metaEntries = [
    { title: labels.title },
    {
      name: "description",
      content: labels.description,
    },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
    {
      property: "og:title",
      content: labels.title,
    },
    {
      property: "og:description",
      content: labels.description,
    },
  ];

  if (baseUrl) {
    metaEntries.push({
      property: "og:url",
      content: `${baseUrl}/${lang}/unsubscribe`,
    });
  }

  return [...metaEntries, ...links];
};

