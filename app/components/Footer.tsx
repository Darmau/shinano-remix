import TwitterIcon from "~/icons/Twitter";
import GithubIcon from "~/icons/Github";
import YoutubeIcon from "~/icons/Youtube";
import InstagramIcon from "~/icons/Instagram";
import {Link} from "@remix-run/react";
import RSSIcon from "~/icons/RSS";
import {footerLinks} from "~/utils/getFooterLabels";

const navigation = {
  social: [
    {
      name: 'GitHub',
      href: 'https://github.com/darmau',
      icon: (props: React.SVGProps<SVGSVGElement>) => <GithubIcon {...props} />,
    },
    {
      name: 'X',
      href: 'https://x.com/darmau8964',
      icon: (props: React.SVGProps<SVGSVGElement>) => <TwitterIcon {...props} />,
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/ridamoe',
      icon: (props: React.SVGProps<SVGSVGElement>) => <InstagramIcon {...props} />,
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@darmau',
      icon: (props: React.SVGProps<SVGSVGElement>) => <YoutubeIcon {...props} />,
    },
  ],
}

export default function Footer({lang, currentYear, items}: {lang: string, currentYear: number, items: footerLinks[]}) {

  return (
      <footer aria-labelledby = "footer-heading" className = "bg-white border-t">
        <h2 id = "footer-heading" className = "sr-only">
          Footer
        </h2>
        <div className = "mx-auto max-w-8xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className = "xl:grid xl:grid-cols-2 xl:gap-8">
            <img
                alt = "可可托海没有海"
                src = "/favicon.svg"
                className = "h-12"
            />
            <div className = "my-16 grid grid-cols-2 lg:grid-cols-4 gap-8 xl:mt-0">

              {items?.map((block, index) => (
                  <div key={index} className="flex flex-col gap-4">
                    <h3 className = "text-sm font-semibold leading-6 text-gray-900">{block.name}</h3>
                    {block.items.map((item, index) => (
                        <Link
                            key = {index}
                            to = {item.href} prefetch = "intent"
                            className = "text-sm leading-6 text-zinc-600 hover:text-zinc-900"
                        >
                          {item.name}
                        </Link>
                    ))}
                  </div>
              ))}

            </div>
          </div>

          <div className = "mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
            <div className = "flex space-x-6 md:order-2">
              <Link to = {`${lang}/rss`} className = "text-gray-400 hover:text-gray-500">
                <span className = "sr-only">RSS</span>
                <RSSIcon className = "h-6 w-6"/>
              </Link>
              {navigation.social.map((item) => (
                  <a
                      key = {item.name} href = {item.href} target = "_blank" rel = "noreferrer"
                      className = "text-gray-400 hover:text-gray-500"
                  >
                    <span className = "sr-only">{item.name}</span>
                    <item.icon aria-hidden = "true" className = "h-6 w-6"/>
                  </a>
              ))}
            </div>
            <p className = "mt-8 text-xs leading-5 text-gray-500 md:order-1 md:mt-0">
              &copy; 2019 - {currentYear} Design and Develop by 李大毛. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  )
}
