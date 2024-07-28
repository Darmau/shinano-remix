import {Json} from "~/types/supabase";
import {Content} from "~/components/ContentContainer";
import {Link} from "@remix-run/react";

type ContentStructure = {
  content: Content[];
};

// 类型守卫函数
function isContentStructure(content: Json): content is ContentStructure {
  return (
      typeof content === "object" &&
      content !== null &&
      "content" in content &&
      Array.isArray((content as ContentStructure).content)
  );
}

// 将heading里的节点type为text的内容提取出来，拼接成完整标题
function getHeadingText(heading: Content) {
  return heading.content?.filter(node => node.type === 'text').map(node => node.text).join('');
}

function generateTableOfContents(nodes: Content[]) {
  const toc = nodes.filter(node => node.type === 'heading');
  return (
      <>
        {toc.map((heading, index) => {
        switch (heading.attrs?.level) {
          case 2:
            return (
                <Link key={index} to={{hash: `#${heading.attrs?.id}`}} className="font-medium text-zinc-700 hover:text-violet-700">
                  {getHeadingText(heading)}
                </Link>
            )
          case 3:
            return (
                <Link key={index} to={{hash: `#${heading.attrs?.id}`}} className="pl-2 text-zinc-600 hover:text-violet-700">
                  {getHeadingText(heading)}
                </Link>
            )
          case 4:
            return (
                <Link key={index} to={{hash: `#${heading.attrs?.id}`}} className="pl-4 text-zinc-500 hover:text-violet-700">
                  {getHeadingText(heading)}
                </Link>
            )
        }
      })}
      </>
  )
}

export default function Catalog({content}: { content: Json }) {
  if (!content || !isContentStructure(content)) {
    return (
        <div>
          <p>没有目录</p>
        </div>
    );
  }

  const article = content.content as Content[];

  return (
      <nav aria-label="Table of contents"
           className="md:sticky md:top-24 md:h-fit flex flex-col gap-2"
      >
        {generateTableOfContents(article)}
      </nav>
  );
}
