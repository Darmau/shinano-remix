import {useOutletContext} from "@remix-run/react";
import getDate from "~/utils/getDate";

export interface CommentProps {
  id: number;
  user_id: number;
  content_text: string;
  created_at: string;
  is_anonymous: boolean;
  users: {
    id: number,
    name: string,
  }
}

export function CommentBlock({comment}: {comment: CommentProps}) {
  const {lang} = useOutletContext<{lang: string}>();
  return (
      <div className="pt-8">
        <h4 className="font-medium text-zinc-800 mb-1">{comment.users.name}</h4>
        <div className="text-sm text-zinc-500">{getDate(comment.created_at, lang)}</div>
        <div className="my-4 text-base text-zinc-700 space-y-2"><CommentContent content={comment.content_text} /></div>
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
