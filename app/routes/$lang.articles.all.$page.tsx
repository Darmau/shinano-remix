import Subnav from "~/components/Subnav";

export default function AllArticles () {
  return (
      <>
        <Subnav active="article" />
        <div className="w-full max-w-8xl mx-auto">全部文章</div>
      </>
  )
}
