import type { CommentProps } from "~/types/Comment.tsx";
import { CheckBadgeIcon, IdentificationIcon } from "@heroicons/react/20/solid";

export default function Username({ comment }: { comment: CommentProps }) {
  if (comment.is_anonymous) {
    return (
      <h4 className="flex items-center font-medium text-zinc-800 mb-2 hover:text-violet-700">
        {comment.website ? (
          <a 
            className="text-violet-700 hover:text-violet-500"
            href={comment.website} 
            target="_blank" 
            rel="noreferrer">
            {comment.name}
          </a>
        ) : (
          <span>{comment.name}</span>
        )}
      </h4>
    )
  }
  else {
    return (
      <h4 className="flex items-center gap-1 font-medium text-zinc-800 mb-2">
        {comment.users && comment.users.website ? (
          <a
            className="text-violet-700 hover:text-violet-500"
            href={comment.users.website}
            target="_blank"
            rel="noreferrer">
            {comment.users?.name}
          </a>
        ) : (<span>{comment.users?.name}</span>)}
        {comment.users?.role === 'admin' ?
          <IdentificationIcon
            className="w-4 h-4 inline-block text-violet-700"
          />
          : <CheckBadgeIcon className="w-4 h-4 inline-block text-violet-700" />
        }
      </h4>
    )
  }
}