
export interface CommentProps {
  id: number;
  user_id: number;
  content_text: string;
  created_at: string;
  reply_to: {
    id: number,
    content_text: string,
    created_at: string,
    users: {
      id: number,
      name: string
    }
  } | null;
  users: {
    id: number,
    name: string,
  }
}

export function CommentBlock({comment}: {comment: CommentProps}) {
  return (
      <div>
        <div>{comment.content_text}</div>
        <div>{comment.created_at}</div>
        <div>{comment.users.name}</div>
      </div>
  )
}
