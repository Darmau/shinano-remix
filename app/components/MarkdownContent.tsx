import { useMemo } from "react";
import { marked } from "marked";

const markdownOptions = {
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
} as const;

export default function CommentContent({ content }: { content: string }) {
  const html = useMemo(() => {
    const escaped = escapeHtml(content);
    const rendered = marked.parse(escaped, markdownOptions);
    return typeof rendered === "string" ? rendered : "";
  }, [content]);

  return (
    <div
      className="comment-markdown"
      dangerouslySetInnerHTML={{ __html: html }
      }
    />
  );
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
