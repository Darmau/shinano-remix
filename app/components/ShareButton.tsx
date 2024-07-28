import {useState} from "react";
import TwitterIcon from "~/icons/Twitter";
import CopyIcon from "~/icons/Copy";
import getLanguageLabel from "~/utils/getLanguageLabel";
import Text from '~/locales/utils';

export default function ShareButton({url, title, lang}: {url: string, title: string, lang: string}) {
  const label = getLanguageLabel(Text, lang);
  const [showMessage, setShowMessage] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const encodeUrl = encodeURIComponent(url);
  const encodeTitle = encodeURIComponent(title);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeTitle}&url=${encodeUrl}&via=darmaulee`;

  return (
      <div className="flex justify-start gap-3 items-center">
        {showMessage && <p className="text-sm text-green-600">{label.coppied}</p>}
        <button onClick={copyToClipboard} className="group flex gap-2 border rounded-md shadow-sm p-2 justify-between">
          <CopyIcon className="h-5 w-5 group-hover:text-zinc-900" />
          <span className="text-sm text-zinc-700 group-hover:font-medium">{label.copy_link}</span>
        </button>
        <a
            className="twitter-share-button border rounded-md shadow-sm p-2 group"
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
        >
          <TwitterIcon className="h-5 w-5 text-zinc-600 group-hover:text-zinc-900" />
        </a>
      </div>
  )
}
