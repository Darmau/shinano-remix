export type CommentProps = {
  id: number;
  user_id: number | null;
  name: string | null;
  website: string | null;
  content_text: string;
  created_at: string;
  is_anonymous: boolean;
  reply_to: {
    id: number,
    content_text: string,
    is_anonymous: boolean,
    name: string,
    users: {
      id: number;
      name: string;
    }
  }
  // anon 只能读到 users 的白名单列，role 不在其中
  users: {
    id: number,
    name: string,
    website: string | null
  } | null;
  // 只有登录用户在个人页读得到，公开评论列表不会带这一列
  receive_notification?: boolean;
}