// 接收一个正整数，返回一个包含 5 个星星的元素，其中前 n 个星星为实心，后面的星星为空心。
// 例如，如果传入 3，则返回的元素为：★★★☆☆ 实心用StarIcon，空心用OutlineStarIcon

import {StarIcon as Solid} from "@heroicons/react/24/solid";
import {StarIcon as Outline} from "@heroicons/react/24/outline";

export default function RateStars({n}: { n: number | null }) {
  if(n === null) return (
      <div>
        <Outline className="w-4 h-4 text-gray-500"/>
        <Outline className="w-4 h-4 text-gray-500"/>
        <Outline className="w-4 h-4 text-gray-500"/>
        <Outline className="w-4 h-4 text-gray-500"/>
        <Outline className="w-4 h-4 text-gray-500"/>
      </div>
  );

  return (
    <div className="flex gap-1">
      {[...Array(n).keys()].map((i) => (
        <Solid key={i} className="w-4 h-4 text-yellow-500"/>
      ))}
      {[...Array(5 - n).keys()].map((i) => (
        <Outline key={i} className="w-4 h-4 text-gray-500"/>
      ))}
    </div>
  )
}
