import TwitterIcon from "~/icons/Twitter";
import GithubIcon from "~/icons/Github";
import YoutubeIcon from "~/icons/Youtube";
import InstagramIcon from "~/icons/Instagram";
import getLanguageLabel from "~/utils/getLanguageLabel";
import FooterText from "~/locales/footer";
import {Link} from "@remix-run/react";
import RSSIcon from "~/icons/RSS";
import {Config} from "~/root";
import {useContext} from "react";

const navigation = {
  blog: [
    {name: 'article', href: '/articles/all/1'},
    {name: 'photography', href: '/photos/all/1'},
    {name: 'thought', href: '/thoughts/all/1'},
  ],
  about: [
    {name: 'about_me', href: '/about'},
    {name: 'contact', href: '/contact'},
    {name: 'tech_stack', href: '/tech'},
    {name: 'stats', href: '/stats'},
  ],
  social: [
    {
      name: 'GitHub',
      href: 'https://github.com/darmau',
      icon: (props: React.SVGProps<SVGSVGElement>) => <GithubIcon {...props} />,
    },
    {
      name: 'X',
      href: 'https://x.com/darmaulee',
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

export default function Footer() {
  const {lang} = useContext(Config);
  const label = getLanguageLabel(FooterText, lang);
  const currentYear = new Date().getFullYear();

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
            <div className = "my-16 grid grid-cols-2 gap-8 xl:mt-0">
              <div>
                <h3 className = "text-sm font-semibold leading-6 text-gray-900">{label.blog}</h3>
                <ul className = "mt-6 space-y-4">
                  {navigation.blog.map((item) => (
                      <li key = {item.name}>
                        <Link
                            to = {`/${lang}${item.href}`} prefetch = "intent"
                            className = "text-sm leading-6 text-gray-600 hover:text-gray-900"
                        >
                          {label[item.name]}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className = "text-sm font-semibold leading-6 text-gray-900">{label.about}</h3>
                <ul className = "mt-6 space-y-4">
                  {navigation.about.map((item) => (
                      <li key = {item.name}>
                        <Link
                            to = {`/${lang}${item.href}`} prefetch = "intent"
                            className = "text-sm leading-6 text-gray-600 hover:text-gray-900"
                        >
                          {label[item.name]}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>
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
