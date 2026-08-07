// 2026-08-07 起，comment 表上匿名插入策略带了 WITH CHECK：content_text 必须非空
// 且不超过 5000 字符，否则 Postgres 会直接以 42501 拒绝整条 INSERT。
// 在服务端先拦一道，把权限错误换成访客看得懂的提示。
export const COMMENT_MAX_LENGTH = 5000;

type ValidationResult = { text: string; error: null } | { text: null; error: string };

export function validateCommentText(raw: unknown): ValidationResult {
  const text = typeof raw === 'string' ? raw.trim() : '';

  if (!text) {
    return { text: null, error: '评论内容不能为空。Comment cannot be empty.' };
  }

  if (text.length > COMMENT_MAX_LENGTH) {
    return {
      text: null,
      error: `评论内容不能超过 ${COMMENT_MAX_LENGTH} 字。Comment must be ${COMMENT_MAX_LENGTH} characters or fewer.`
    };
  }

  return { text, error: null };
}
