import {useOutletContext} from "@remix-run/react";
import getDate from "~/utils/getDate";
import getLanguageLabel from "~/utils/getLanguageLabel";
import CommentText from '~/locales/comment';

export interface CommentProps {
  id: number;
  user_id: number;
  content_text: string;
  created_at: string;
  is_anonymous: boolean;
  reply_to: {
    id: number,
    content_text: string,
    is_anonymous: boolean,
    users: {
      id: number;
      name: string;
    }
  }
  users: {
    id: number,
    name: string,
    role: string
  }
}

export function CommentBlock({comment, onReply}: {comment: CommentProps, onReply: (comment: CommentProps) => void}) {
  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(CommentText, lang);
  return (
      <div className = "pt-8">
        <h4 className = "font-medium text-zinc-800 mb-2">
          {comment.is_anonymous ? 'Anonymous' : comment.users.name}
          {comment.users.role === 'admin' && (
              <span
                  className = "rounded bg-violet-100 border border-violet-500 text-violet-700 text-xs p-1 ml-2"
              >{label.author}</span>
          )}
        </h4>
        <div className = "text-sm text-zinc-500">{getDate(comment.created_at, lang)}</div>

        {comment.reply_to && (
            <div className="mt-2">
              <p className = "p-4 bg-zinc-100 text-sm text text-zinc-700 mb-4">{`回复 ${comment.reply_to.is_anonymous ? 'Anonymous' : comment.reply_to.users.name}: ${comment.reply_to.content_text.substring(0, 120)}...`}</p>
            </div>
        )}

        <div className = "my-4 text-base text-zinc-700 space-y-2"><CommentContent content = {comment.content_text}/>
        </div>
        <button
            onClick = {() => onReply(comment)}
            className = "text-sm text-violet-700 hover:text-violet-500"
        >
          {label.reply}
        </button>
      </div>
  )
}

function CommentContent({content}: { content: string }) {
  // 将字符串按换行符分割成数组
  const lines = content.split('\n');

  // 将每一行转换为<p>标签包裹的内容,并用join方法连接
  return lines.map((line, index) => (
      <p key={index}>{line}</p>
  ));
}
