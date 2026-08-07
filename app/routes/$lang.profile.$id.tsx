import { Form, Link, redirect, useActionData, useLoaderData, useOutletContext } from "react-router";
import type { Route } from "./+types/$lang.profile.$id";
import { createClient } from "~/utils/supabase/server";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ProfileText from "~/locales/profile";
import getTime from "~/utils/getTime";
import { TrashIcon, BellIcon, BellSlashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type CommentWithContent = {
  id: number;
  content_text: string | null;
  created_at: string;
  receive_notification: boolean;
  to_article: number | null;
  to_photo: number | null;
  to_thought: number | null;
  reply_to: {
    id: number;
    content_text: string | null;
  } | null;
  article: {
    title: string;
    slug: string;
    lang: number;
  } | null;
  photo: {
    title: string;
    slug: string;
    lang: number;
  } | null;
  thought: {
    content_text: string;
    slug: string;
  } | null;
};

type LoaderData = {
  userProfile: {
    id: number;
    name: string | null;
    email: string | null;
    created_at: string | null;
  };
  comments: CommentWithContent[];
  isOwnProfile: boolean;
};

type ActionData = {
  success?: string;
  error?: string;
};

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { supabase } = createClient(request, context);
  const { data: { session } } = await supabase.auth.getSession();
  const userId = params.id as string;

  // 检查是否登录
  if (!session) {
    return redirect(`/${params.lang}/login`);
  }

  // 检查是否是用户自己的资料
  const isOwnProfile = session.user.id === userId;

  if (!isOwnProfile) {
    throw new Response("Unauthorized", { status: 403 });
  }

  // 获取用户资料
  const { data: publicUser } = await supabase
    .from("users")
    .select("id, name, created_at, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!publicUser) {
    throw new Response("User not found", { status: 404 });
  }

  // 从 session 中获取邮箱（用户已登录且只能查看自己的资料）
  const userProfile = {
    id: publicUser.id,
    name: publicUser.name,
    email: session.user.email || null,
    created_at: publicUser.created_at,
  };

  // 获取用户的所有评论
  const { data: comments } = await supabase
    .from("comment")
    .select(`
      id,
      content_text,
      created_at,
      receive_notification,
      to_article,
      to_photo,
      to_thought,
      reply_to:reply_to (
        id,
        content_text
      )
    `)
    .eq("user_id", publicUser.id)
    .order("created_at", { ascending: false });

  // 为每个评论获取关联的内容
  const commentsWithContent = await Promise.all(
    (comments || []).map(async (comment) => {
      let article = null;
      let photo = null;
      let thought = null;

      if (comment.to_article) {
        const { data } = await supabase
          .from("article")
          .select("title, slug, lang")
          .eq("id", comment.to_article)
          .maybeSingle();
        article = data;
      } else if (comment.to_photo) {
        const { data } = await supabase
          .from("photo")
          .select("title, slug, lang")
          .eq("id", comment.to_photo)
          .maybeSingle();
        photo = data;
      } else if (comment.to_thought) {
        const { data } = await supabase
          .from("thought")
          .select("content_text, slug")
          .eq("id", comment.to_thought)
          .maybeSingle();
        thought = data;
      }

      return {
        ...comment,
        article,
        photo,
        thought,
      } as CommentWithContent;
    })
  );

  return {
    userProfile,
    comments: commentsWithContent,
    isOwnProfile,
  } satisfies LoaderData;
}

export const meta: Route.MetaFunction = ({ params, data }) => {
  const lang = params.lang as string;
  const label = getLanguageLabel(ProfileText, lang);
  
  return [
    { title: `${label.my_profile} - ${data?.userProfile?.name || "User"}` },
    { name: "robots", content: "noindex, nofollow" },
  ];
};

function CommentItem({ 
  comment, 
  lang, 
  label 
}: { 
  comment: CommentWithContent; 
  lang: string;
  label: {
    [key: string]: string;
  };
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 确定内容类型和链接
  let contentTitle = "";
  let contentLink = "";
  let contentType = "";

  if (comment.article) {
    contentTitle = comment.article.title;
    contentLink = `/${lang}/article/${comment.article.slug}#comment-${comment.id}`;
    contentType = "article";
  } else if (comment.photo) {
    contentTitle = comment.photo.title;
    contentLink = `/${lang}/album/${comment.photo.slug}#comment-${comment.id}`;
    contentType = "album";
  } else if (comment.thought) {
    contentTitle = comment.thought.content_text.slice(0, 30) + "...";
    contentLink = `/${lang}/thought/${comment.thought.slug}#comment-${comment.id}`;
    contentType = "thought";
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 hover:shadow-md transition-shadow">
      {/* 内容标题 */}
      <div className="mb-3">
        <Link 
          to={contentLink}
          className="text-lg font-medium text-violet-700 hover:text-violet-800 hover:underline"
        >
          {contentTitle}
        </Link>
      </div>

      {/* 回复的评论 */}
      {comment.reply_to && (
        <div className="mb-3 pl-4 border-l-2 border-zinc-200">
          <p className="text-sm text-zinc-500 mb-1">{label.replied_to}:</p>
          <p className="text-sm text-zinc-600 line-clamp-2">
            {comment.reply_to.content_text}
          </p>
        </div>
      )}

      {/* 评论内容 */}
      <div className="mb-3">
        <p className="text-zinc-700 whitespace-pre-wrap">{comment.content_text}</p>
      </div>

      {/* 底部信息和操作 */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
        <time className="text-sm text-zinc-500">
          {getTime(comment.created_at, lang)}
        </time>

        <div className="flex items-center gap-2">
          {/* 通知切换按钮 */}
          <Form method="post" className="inline">
            <input type="hidden" name="intent" value="toggle_notification" />
            <input type="hidden" name="commentId" value={comment.id} />
            <input type="hidden" name="currentValue" value={String(comment.receive_notification)} />
            <button
              type="submit"
              title={label.toggle_notification}
              className={`p-2 rounded-md transition-colors ${
                comment.receive_notification
                  ? "text-violet-600 hover:bg-violet-50"
                  : "text-zinc-400 hover:bg-zinc-100"
              }`}
            >
              {comment.receive_notification ? (
                <BellIcon className="h-5 w-5" />
              ) : (
                <BellSlashIcon className="h-5 w-5" />
              )}
            </button>
          </Form>

          {/* 删除按钮 */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title={label.delete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Form method="post" className="inline">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="commentId" value={comment.id} />
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  {label.delete_confirm}
                </button>
              </Form>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { lang } = useOutletContext<{ lang: string }>();
  const { userProfile, comments, isOwnProfile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const label = getLanguageLabel(ProfileText, lang);

  if (!isOwnProfile) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">{label.unauthorized}</h1>
          <p className="text-zinc-600 mb-6">{label.unauthorized_desc}</p>
          <Link
            to={`/${lang}`}
            className="inline-block px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            {label.go_home}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧 - 评论列表 */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">{label.my_comments}</h2>

            {/* 操作反馈 */}
            {actionData?.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">{actionData.success}</p>
              </div>
            )}
            {actionData?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{actionData.error}</p>
              </div>
            )}

            {/* 评论列表 */}
            {comments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-12 text-center">
                <p className="text-zinc-500">{label.no_comments}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    lang={lang}
                    label={label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 右侧 - 用户信息 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">{label.user_info}</h2>

              {/* 用户信息 */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-500">{label.user_info}</label>
                  <p className="text-base text-zinc-900 mt-1">{userProfile.name || "未设置"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-500">Email</label>
                  <p className="text-base text-zinc-900 mt-1 break-all">{userProfile.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-500">{label.my_comments}</label>
                  <p className="text-base text-zinc-900 mt-1">{comments.length}</p>
                </div>

                {userProfile.created_at && (
                  <div>
                    <label className="text-sm font-medium text-zinc-500">注册时间</label>
                    <p className="text-base text-zinc-900 mt-1">
                      {getTime(userProfile.created_at, lang)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const { supabase } = createClient(request, context);
  const { data: { session } } = await supabase.auth.getSession();
  const lang = params.lang as string;
  const userId = params.id as string;
  const label = getLanguageLabel(ProfileText, lang);

  if (!session || session.user.id !== userId) {
    return { error: label.unauthorized } satisfies ActionData;
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const commentId = parseInt(formData.get("commentId") as string, 10);

  // 获取用户的 public.users.id
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!publicUser) {
    return { error: label.unauthorized } satisfies ActionData;
  }

  // 验证评论属于当前用户
  const { data: comment } = await supabase
    .from("comment")
    .select("id, user_id")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment || comment.user_id !== publicUser.id) {
    return { error: label.unauthorized } satisfies ActionData;
  }

  if (intent === "delete") {
    // 删除评论
    const { error } = await supabase
      .from("comment")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Failed to delete comment:", error);
      return { error: label.delete_error } satisfies ActionData;
    }

    return { success: label.delete_success } satisfies ActionData;
  } else if (intent === "toggle_notification") {
    // 切换通知设置
    const currentValue = formData.get("currentValue") === "true";
    const { error } = await supabase
      .from("comment")
      .update({ receive_notification: !currentValue })
      .eq("id", commentId);

    if (error) {
      console.error("Failed to update notification:", error);
      return { error: label.update_error } satisfies ActionData;
    }

    return { success: label.update_success } satisfies ActionData;
  }

  return { error: "Unknown action" } satisfies ActionData;
}
