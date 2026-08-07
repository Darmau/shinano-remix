import { useOutletContext } from "react-router";
import getTime from "~/utils/getTime";
import getLanguageLabel from "~/utils/getLanguageLabel";
import CommentText from '~/locales/comment';
import type { CommentProps } from "~/types/Comment.tsx";
import Username from "./Username";
import MarkdownContent from "./MarkdownContent";

export function CommentBlock({ comment, onReply }: { comment: CommentProps, onReply: (comment: CommentProps) => void }) {
  const { lang } = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(CommentText, lang);
  return (
    <div className="pt-8">
      <Username comment={comment} />

      <div className="text-sm text-zinc-500">{getTime(comment.created_at, lang)}</div>

      {comment.reply_to && (
        <div className="mt-2">
          <p className="p-4 bg-zinc-100 text-sm text text-zinc-700 mb-4">{`回复 ${comment.reply_to.is_anonymous ? comment.reply_to.name : comment.reply_to.users.name}: ${comment.reply_to.content_text.substring(0, 120)}...`}</p>
        </div>
      )}

      <div className="my-4 text-base text-zinc-700 space-y-2">
        <MarkdownContent content={comment.content_text} />
      </div>
      <button
        onClick={() => onReply(comment)}
        className="text-sm text-violet-700 hover:text-violet-500"
      >
        {label.reply}
      </button>
    </div>
  )
}
