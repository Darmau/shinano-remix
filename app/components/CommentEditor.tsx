import {Form, useOutletContext} from "@remix-run/react";
import CommentText from '~/locales/comment';
import getLanguageLabel from "~/utils/getLanguageLabel";
import {Session} from "@supabase/supabase-js";
import {CommentProps} from "~/components/CommentBlock";
import { Turnstile } from '@marsidev/react-turnstile'

export default function CommentEditor({contentTable, contentId, session, replyingTo, onCancelReply}: {
  contentTable: string,
  contentId: number,
  session: Session | null,
  replyingTo: CommentProps | null,
  onCancelReply: () => void
}) {
  const {lang, turnstileSiteKey} = useOutletContext<{ lang: string, turnstileSiteKey: string }>();
  const label = getLanguageLabel(CommentText, lang);

  if (!session) {
    return (
        <Form method = "post" id = "comment-editor" className = "border rounded-md">
          <input name = {contentTable} type = "hidden" value = {contentId}/>

          <div className = "p-4 border-b">
            <input name = "reply_to" type = "hidden" value = {replyingTo ? replyingTo.id : ''}/>

            <div className = "flex gap-4">
              <input
                  className = "w-full border-0 border-b border-b-gray-200 p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-violet-600 focus:ring-0 sm:text-sm sm:leading-6"
                  name = "name"
                  type = "text"
                  placeholder = "你的名字"
              />
              <input
                  className = "w-full border-0 border-b border-b-gray-200 p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-violet-600 focus:ring-0 sm:text-sm sm:leading-6"
                  name = "email"
                  type = "email"
                  placeholder = "邮箱"
              />
              <input
                  className = "w-full border-0 border-b border-b-gray-200 p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-violet-600 focus:ring-0 sm:text-sm sm:leading-6"
                  name = "website"
                  type = "url"
                  placeholder = "网站"
              />
            </div>

            <div className = "mt-4">
              <label htmlFor = "comment" className = "sr-only">
                Add your comment
              </label>
              {replyingTo &&
                  <div className = "p-4 bg-zinc-100 text-sm text text-zinc-700 mb-4">
                    {`${label.reply} ${replyingTo.is_anonymous ? replyingTo.name : replyingTo.users!.name}: ${replyingTo.content_text.substring(0, 100)}...`}
                  </div>
              }
              <textarea
                  rows = {5}
                  name = "content_text"
                  placeholder = {label.add_comment}
                  className = "block w-full resize-y border-0 border-b border-transparent p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-violet-600 focus:ring-0 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className = "flex flex-col gap-4 justify-start p-4">
            <Turnstile
                siteKey={turnstileSiteKey}
            />
            <div className = "space-x-4">
              <button
                  type = "submit"
                  className = "break-keep inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
              >
                {label.submit}
              </button>
              {replyingTo && (
                  <button
                      type = "button"
                      onClick = {onCancelReply}
                      className = "text-sm font-medium text-red-400"
                  >
                    {label.cancel_reply}
                  </button>
              )}
            </div>
          </div>
        </Form>
    )
  } else {
    return (
        <Form method = "post" id = "comment-editor" className = "border rounded-md">
          <input name = {contentTable} type = "hidden" value = {contentId}/>
          <input name = "reply_to" type = "hidden" value = {replyingTo ? replyingTo.id : ''}/>
          <div className = "p-4 border-b border-gray-200">
            <label htmlFor = "comment" className = "sr-only">
              Add your comment
            </label>
            {replyingTo &&
                <div className = "p-4 bg-zinc-100 text-sm text text-zinc-700 mb-4">
                  {`${label.reply} ${replyingTo.is_anonymous ? replyingTo.name : replyingTo.users!.name}: ${replyingTo.content_text.substring(0, 100)}...`}
                </div>
            }
            <textarea
                rows = {5}
                name = "content_text"
                placeholder = {label.add_comment}
                className = "block w-full resize-y border-0 border-b border-transparent p-0 pb-2 text-gray-900 placeholder:text-gray-400 focus:border-violet-600 focus:ring-0 sm:text-sm sm:leading-6"
            />
          </div>

          <div className = "flex gap-4 justify-end p-4">
            {replyingTo && (
                <button
                    type = "button"
                    onClick = {onCancelReply}
                    className = "text-sm font-medium text-red-400"
                >
                  {label.cancel_reply}
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
