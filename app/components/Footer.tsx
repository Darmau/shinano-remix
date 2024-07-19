import TwitterIcon from "~/icons/Twitter";
import GithubIcon from "~/icons/Github";
import YoutubeIcon from "~/icons/Youtube";
import InstagramIcon from "~/icons/Instagram";
import getLanguageLabel from "~/utils/getLanguageLabel";
import FooterText from "~/locales/footer";
import {Link} from "@remix-run/react";

const navigation = {
  blog: [
    { name: 'article', href: '/articles/all/1' },
    { name: 'photography', href: '/photos/all/1' },
    { name: 'thought', href: '/thoughts/all/1' },
  ],
  about: [
    { name: 'about_me', href: '/about' },
    { name: 'contact', href: '/contact' },
    { name: 'tech_stack', href: '/tech' },
    { name: 'stats', href: '/stats' },
  ],
  social: [
    {
      name: 'Instagram',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => <InstagramIcon {...props} />,
    },
    {
      name: 'X',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => <TwitterIcon {...props} />,
    },
    {
      name: 'GitHub',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => <GithubIcon {...props} />,
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (props: React.SVGProps<SVGSVGElement>) => <YoutubeIcon {...props} />,
    },
  ],
}

export default function Footer({lang}: {lang: string}) {
  const label = getLanguageLabel(FooterText, lang)
  return (
      <footer aria-labelledby="footer-heading" className="bg-white">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-2 xl:gap-8">
            <img
                alt="可可托海没有海"
                src="/favicon.svg"
                className="h-12"
            />
            <div className = "mt-16 grid grid-cols-2 gap-8 xl:mt-0">
              <div>
                <h3 className = "text-sm font-semibold leading-6 text-gray-900">{label.blog}</h3>
                <ul className = "mt-6 space-y-4">
                  {navigation.blog.map((item) => (
                      <li key = {item.name}>
                        <Link to = {`/${lang}${item.href}`} prefetch="intent" className = "text-sm leading-6 text-gray-600 hover:text-gray-900">
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
                        <Link to = {`/${lang}${item.href}`} prefetch="intent" className = "text-sm leading-6 text-gray-600 hover:text-gray-900">
                          {label[item.name]}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div
              className = "mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24 lg:flex lg:items-center lg:justify-between"
          >
            <div>
              <h3 className = "text-sm font-semibold leading-6 text-gray-900">Subscribe to our newsletter</h3>
              <p className = "mt-2 text-sm leading-6 text-gray-600">
                The latest news, articles, and resources, sent to your inbox weekly.
              </p>
            </div>
            <form className = "mt-6 sm:flex sm:max-w-md lg:mt-0">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                  id="email-address"
                  name="email-address"
                  type="email"
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full min-w-0 appearance-none rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:w-56 sm:text-sm sm:leading-6"
              />
              <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
          <div className="mt-8 border-t border-gray-900/10 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              {navigation.social.map((item) => (
                  <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">{item.name}</span>
                    <item.icon aria-hidden="true" className="h-6 w-6" />
                  </a>
              ))}
            </div>
            <p className="mt-8 text-xs leading-5 text-gray-500 md:order-1 md:mt-0">
              &copy; 2020 Your Company, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  )
}
