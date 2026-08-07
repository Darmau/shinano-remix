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
  users: {
    id: number,
    name: string,
    website: string | null,
    role: string
  } | null;
  receive_notification: boolean;
}