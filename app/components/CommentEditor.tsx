import {Form, Link, useOutletContext} from "@remix-run/react";
import CommentText from '~/locales/comment';
import getLanguageLabel from "~/utils/getLanguageLabel";
import {Session} from "@supabase/supabase-js";
import {CommentProps} from "~/components/CommentBlock";

export default function CommentEditor({contentTable, contentId, session, replyingTo, onCancelReply}: {
  contentTable: string,
  contentId: number,
  session: Session | null,
  replyingTo: CommentProps | null,
  onCancelReply: () => void
}) {
  const {lang} = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(CommentText, lang);


  if (!session) {
    return (
        <div className = "flex justify-between items-center border-b pb-8">
          <p className = "text-sm text-zinc-500">{label.login_comment}</p>
          <div className = "flex justify-between gap-4">
            <Link
                to = {`/${lang}/login`}
                className = "grow text-center text-sm text-zinc-700 border py-3 px-4 rounded-md font-medium hover:bg-zinc-100"
            >{label.login}</Link>
            <Link
                to = {`/${lang}/signup`}
                className = "grow text-center text-sm bg-violet-700 text-white py-3 px-4 rounded-md font-medium hover:bg-violet-400"
            >{label.signup}</Link>
          </div>
        </div>
    )
  } else {
    return (
        <Form method = "post" id="comment-editor" key={resetKey}>
          <input name = {contentTable} type = "hidden" value = {contentId}/>
          <input name = "reply_to" type = "hidden" value = {replyingTo ? replyingTo.id : ''}/>
          <div className = "border-b border-gray-200 focus-within:border-violet-600">
            <label htmlFor = "comment" className = "sr-only">
              Add your comment
            </label>
            {replyingTo &&
                <div>
                  {`回复 ${replyingTo.users.name}: ${replyingTo.content_text.substring(0, 50)}...`}
                </div>
            }
            <textarea
                rows = {5}
                name = "content_text"
                placeholder = {label.add_comment}
                className = "block w-full resize-y border-0 border-b border-transparent p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-violet-600 focus:ring-0 sm:text-sm sm:leading-6"
            />
          </div>
          <div className = "flex justify-between items-center mt-3">
            <div className = "flex justify-start gap-2 items-center">
              <input name = "is_anonymous" type = "checkbox"/>
              <label htmlFor = "is_anonymous" className = "text-sm text-zinc-500">{label.set_anonymous}</label>
            </div>
            {replyingTo && (
                <button type = "button" onClick = {onCancelReply} className = "mr-2">
                  取消回复
                </button>
            )}
            <button
                type = "submit"
                className = "inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              {label.submit}
            </button>
          </div>
        </Form>
    )
  }
}
