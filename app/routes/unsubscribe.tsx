import type { MetaFunction } from "react-router";import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/unsubscribe";
import { createClient } from "~/utils/supabase/server";
import { verifyUnsubscribeToken } from "~/utils/unsubscribeToken.server";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type LoaderData = {
  valid: boolean;
  commentId: number | null;
  error?: string;
};

type ActionData = {
  success: boolean;
  error?: string;
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return {
      valid: false,
      commentId: null,
      error: "缺少取消订阅令牌",
    } satisfies LoaderData;
  }

  // 使用环境变量中的密钥验证 token
  const secret = context.cloudflare.env.RESEND_KEY || "fallback-secret-key";
  const commentId = await verifyUnsubscribeToken(token, secret);

  if (!commentId) {
    return {
      valid: false,
      commentId: null,
      error: "令牌无效或已过期",
    } satisfies LoaderData;
  }

  // 验证评论是否存在
  const { supabase } = createClient(request, context);
  const { data: comment } = await supabase
    .from("comment")
    .select("id, receive_notification")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) {
    return {
      valid: false,
      commentId: null,
      error: "评论不存在",
    } satisfies LoaderData;
  }

  return {
    valid: true,
    commentId,
  } satisfies LoaderData;
}

export const meta: MetaFunction = () => {
  return [
    { title: "取消评论通知 - 积薪 Darmau" },
    { name: "description", content: "取消评论回复通知订阅" },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

export default function Unsubscribe() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (!loaderData.valid) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center mb-4">
            <XCircleIcon className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 text-center mb-4">
            无法取消订阅
          </h1>
          <p className="text-zinc-600 text-center mb-6">
            {loaderData.error || "链接无效或已过期"}
          </p>
          <p className="text-sm text-zinc-500 text-center">
            如果您持续收到不需要的通知，请联系我们的支持团队。
          </p>
        </div>
      </div>
    );
  }

  if (actionData?.success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 text-center mb-4">
            取消订阅成功
          </h1>
          <p className="text-zinc-600 text-center mb-6">
            您已成功取消该评论的回复通知。
          </p>
          <p className="text-sm text-zinc-500 text-center">
            如果以后想再次接收通知，您可以在发表新评论时勾选"有人回复通知我"选项。
          </p>
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
          确认取消订阅
        </h1>
        <p className="text-zinc-600 text-center mb-6">
          您确定要取消该评论的回复通知吗？
        </p>
        <p className="text-sm text-zinc-500 text-center mb-8">
          取消后，当有人回复您的评论时，您将不会再收到邮件提醒。
        </p>

        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{actionData.error}</p>
          </div>
        )}

        <Form method="post">
          <input type="hidden" name="commentId" value={loaderData.commentId || ""} />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "处理中..." : "确认取消订阅"}
          </button>
        </Form>

        <p className="mt-4 text-xs text-zinc-400 text-center">
          如果您误点了此链接，请直接关闭此页面。
        </p>
      </div>
    </div>
  );
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const commentId = formData.get("commentId");

  if (!commentId || typeof commentId !== "string") {
    return {
      success: false,
      error: "缺少评论 ID",
    } satisfies ActionData;
  }

  const { supabase } = createClient(request, context);

  // 更新评论的 receive_notification 字段
  const { error } = await supabase
    .from("comment")
    .update({ receive_notification: false })
    .eq("id", parseInt(commentId, 10));

  if (error) {
    console.error("Failed to unsubscribe:", error);
    return {
      success: false,
      error: "取消订阅失败，请稍后重试",
    } satisfies ActionData;
  }

  return {
    success: true,
  } satisfies ActionData;
}

