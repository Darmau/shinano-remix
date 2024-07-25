export default function HomepageSkeleton() {
  return (
      <div className = "animate-pulse w-full max-w-8xl mx-auto px-4 space-y-8 lg:space-y-12 mb-8 lg:mb-16">
        <div
            className = "flex flex-col gap-8 mt-4 border-b pb-8 lg:pb-12 lg:mt-8 lg:grid lg:grid-cols-2 lg:grid-rows-2"
        >
          <div className = "bg-zinc-100 w-full h-48 lg:row-span-2 lg:col-span-1"></div>
          <div className = "bg-zinc-100 w-full h-48 lg:row-span-2 lg:col-span-1"></div>
          <div className = "bg-zinc-100 w-full h-48 lg:row-span-2 lg:col-span-1"></div>
          <div className = "bg-zinc-100 w-full h-48 lg:row-span-2 lg:col-span-1"></div>
        </div>
        <div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className = "bg-zinc-100 w-full h-48"></div>
          <div className = "bg-zinc-100 w-full h-48"></div>
          <div className = "bg-zinc-100 w-full h-48"></div>
          <div className = "bg-zinc-100 w-full h-48"></div>
          <div className = "bg-zinc-100 w-full h-48"></div>
          <div className = "bg-zinc-100 w-full h-48"></div>
        </div>
      </div>
  )
}
