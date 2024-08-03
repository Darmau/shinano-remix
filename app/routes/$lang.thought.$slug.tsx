import Breadcrumb, {BreadcrumbProps} from "~/components/Breadcrumb";
import {Link, useActionData, useLoaderData, useOutletContext} from "@remix-run/react";
import getLanguageLabel from "~/utils/getLanguageLabel";
import ThoughtText from "~/locales/thought";
import {ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import {createClient} from "~/utils/supabase/server";
import {Json} from "~/types/supabase";
import ContentContainer from "~/components/ContentContainer";
import ResponsiveImage from "~/components/ResponsiveImage";
import {Image} from "~/types/Image";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import {CommentBlock, CommentProps} from "~/components/CommentBlock";
import CommentEditor from "~/components/CommentEditor";
import i18nLinks from "~/utils/i18nLinks";
import getDate from "~/utils/getDate";

export default function ThoughtDetail() {
  const {lang} = useOutletContext<{ lang: string }>();
  const label = getLanguageLabel(ThoughtText, lang);

  const {
    thoughtData,
    thoughtImages,
    comments,
    page,
    limit,
    totalPage,
    session
  } = useLoaderData<typeof loader>();
  const actionResponse = useActionData<typeof action>();

  const breadcrumbPages: BreadcrumbProps[] = [
    {
      name: label.all_thoughts,
      to: `thoughts`,
      current: false
    },
    {
      name: thoughtData.content_text ? `${thoughtData.content_text.slice(0, 10)}...` : '',
      to: `thought/${thoughtData.slug}`,
      current: true
    }
  ]

  return (
      <div className = "w-full max-w-6xl mx-auto p-4 md:py-8 mb-8 lg:mb-16">
        <Breadcrumb pages = {breadcrumbPages}/>
        <div className = "grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className = "col-span-1 lg:col-span-2">
            <ContentContainer content = {thoughtData.content_json as unknown as Json}/>
            {thoughtImages && (
                <div className = "space-y-2">
                  {thoughtImages.map((image) => (
                      <ResponsiveImage
                          key = {image.image!.id} image = {image.image as Image} width = {560}
                          classList = "rounded"
                      />
                  ))}
                </div>
            )}
          </div>

          <div className = "col-span-1 space-y-4">
            <CommentEditor contentTable = {'to_thought'} contentId = {thoughtData.id} session = {session}/>
            <div className = "flex flex-col gap-4 divide-y">
              {actionResponse?.error && <p className = "error">{actionResponse.error}</p>}
              {comments && comments.map((comment) => (
                  <CommentBlock key = {comment.id} comment = {comment as unknown as CommentProps}/>
              ))}
            </div>
            <div className = "py-8 flex justify-between">
              {page > 1 && (
                  <Link
                      to = {{
                        search: `?page=${page - 1}&limit=${limit}`
                      }}
                      className = "rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >{label.previous}</Link>
              )}
              {page < totalPage && (
                  <Link
                      to = {{
                        search: `?page=${page + 1}&limit=${limit}`
                      }}
                      className = "ml-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >{label.next}</Link>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}


export async function loader({
                               request, context, params
                             }: LoaderFunctionArgs) {
  const {supabase} = createClient(request, context);
  const {data: {session}} = await supabase.auth.getSession();
  const slug = params.slug as string;
  const url = new URL(request.url);
  const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20;

  // thought详情
  const {data: thoughtData} = await supabase
  .from('thought')
  .select(`
      id,
      content_json,
      content_text,
      slug,
      created_at
    `)
  .eq('slug', slug)
  .single();

  if (!thoughtData) {
    throw new Response(null, {
      status: 404,
      statusText: 'Thought not exists'
    })
  }

  const {data: thoughtImages} = await supabase
  .from('thought_image')
  .select(`
      order,
      image (id, alt, storage_key, width, height, caption)
    `)
  .eq('thought_id', thoughtData.id)
  .order('order', {ascending: true});

  // 评论数据
  const {data: comments} = await supabase
  .from('comment')
  .select(`
      id,
      user_id,
      content_text,
      created_at,
      is_anonymous,
      users (id, name)
    `)
  .eq('to_thought', thoughtData.id)
  .eq('is_blocked', false)
  .eq('is_public', true)
  .order('created_at', {ascending: false})
  .range((page - 1) * limit, page * limit - 1);

  // 评论总数
  const {count} = await supabase
  .from('comment')
  .select('id', {count: 'exact'})
  .eq('to_thought', thoughtData.id)
  .eq('is_blocked', false)
  .eq('is_public', true);

  // 总页数
  const totalPage = count ? Math.ceil(count / limit) : 1;

  const availableLangs = ["zh", "en", "jp"];

  return json({
    thoughtData,
    thoughtImages,
    comments,
    page,
    limit,
    totalPage,
    session,
    baseUrl: context.cloudflare.env.BASE_URL,
    availableLangs
  })
}

export const meta: MetaFunction<typeof loader> = ({params, data}) => {
  const lang = params.lang as string;
  const baseUrl = data!.baseUrl as string;
  const multiLangLinks = i18nLinks(baseUrl,
      lang,
      data!.availableLangs,
      `thought/${data!.thoughtData.slug}`
  );

  return [
    {title: getDate(data!.thoughtData.created_at!, lang)},
    {
      name: "description",
      content: data!.thoughtData.content_text ? data!.thoughtData.content_text.split(/\r?\n/).join("") : '',
    },
    {
      property: "og:title",
      content: getDate(data!.thoughtData.created_at!, lang)
    },
    {
      property: "og:type",
      content: "article"
    },
    {
      property: "og:url",
      content: `${baseUrl}/${lang}/thought/${data!.thoughtData.slug}`
    },
    {
      property: "og:description",
      content: data!.thoughtData.content_text ? data!.thoughtData.content_text.split(/\r?\n/).join("") : ''
    },
    {
      property: "twitter:card",
      content: "summary"
    },
    {
      property: "twitter:creator",
      content: "@darmau8964"
    },
    ...multiLangLinks
  ];
};

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const {supabase} = createClient(request, context);
  const {data: {session}} = await supabase.auth.getSession();

  if (!session) {
    return json({
      success: false,
      error: 'Unauthorized',
      comment: null
    })
  }

  const {data: userProfile} = await supabase
  .from('users')
  .select('id, user_id')
  .eq('user_id', session.user.id)
  .single();

  if (!userProfile) {
    return json({
      success: false,
      error: 'User not exists',
      comment: null
    })
  }

  const content_text = formData.get('content_text') as string;
  const to_thought = parseInt(formData.get('to_thought') as string);
  const is_anonymous = formData.get('is_anonymous') === 'on';

  const {data: newComment} = await supabase
  .from('comment')
  .insert({
    user_id: userProfile.id,
    content_text,
    to_thought,
    is_anonymous
  })
  .select(`
      id,
      user_id,
      content_text,
      created_at,
      is_anonymous,
      users (id, name)
    `)
  .single();

  return json({
    success: true,
    error: null,
    comment: newComment
  })
}
