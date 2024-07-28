import {useEffect, useState} from 'react'
import {Dialog, DialogPanel, Popover, PopoverButton, PopoverPanel,} from '@headlessui/react'
import {Bars3Icon, XMarkIcon,} from '@heroicons/react/24/outline'
import {NavItem} from '~/locales/navbar'
import {Link, useLocation} from "@remix-run/react";
import Profile from "~/components/Profile";
import TranslateIcon from "~/icons/Translate";

const pathMap = new Map([
  ['', 'article'],
  ['articles', 'article'],
  ['albums', 'album'],
  ['thoughts', 'thought'],
  ['about', 'about'],
  ['site', 'about'],
  ['contact', 'about'],
  ['rss', 'about'],
])

function isCurrentTab(tab: string, path: string): boolean {
  const currentTab = pathMap.get(path.split('/')[2]);
  return currentTab === tab;
}

export default function Navbar({lang, items}: { lang: string, items: NavItem[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const location = useLocation();

  useEffect(() => {
    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
        // 向下滚动
        navbar!.style.top = '-88px'; // 隐藏导航栏
      } else {
        // 向上滚动
        navbar!.style.top = '0'; // 显示导航栏
      }
      lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
      <header id = "navbar" className = "bg-white isolate z-10 fixed top-0 w-full transition-all duration-300">
        <nav aria-label = "Global" className = "border-b">
          <div className = "max-w-8xl mx-auto flex items-center justify-between p-5 lg:px-8">
            <div className = "hidden lg:flex lg:gap-2 lg:items-center">
              <Link to = {`/${lang}`} className = "-m-1.5 p-1.5">
                <img alt = "logo" src = "/favicon.svg" className = "h-8 w-8" width = "32" height = "32"/>
              </Link>
              <Popover>
                <PopoverButton className = "block data-[active]:text-violet-700 data-[hover]:text-violet-700">
                  <TranslateIcon className = "size-6 text-gray-900"/>
                </PopoverButton>
                <PopoverPanel
                    transition
                    anchor = "bottom"
                    className = "z-20 shadow-2xl divide-y divide-zinc-100 rounded-md bg-white text-sm transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
                >
                  <Link
                      reloadDocument
                      to = "/zh"
                      className = "block p-4 w-32 transition hover:bg-zinc-50"
                  >
                    中文
                  </Link>
                  <Link
                      reloadDocument
                      to = "/en"
                      className = "block p-4 w-32 transition hover:bg-zinc-50"
                  >
                    English
                  </Link>
                  <Link
                      reloadDocument
                      to = "/jp"
                      className = "block p-4 w-32 transition hover:bg-zinc-50"
                  >
                    日本語
                  </Link>
                </PopoverPanel>
              </Popover>
            </div>
            <div className = "flex lg:hidden">
              <button
                  type = "button"
                  onClick = {() => setMobileMenuOpen(true)}
                  className = "-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span className = "sr-only">Open Menu</span>
                <Bars3Icon aria-hidden = "true" className = "h-6 w-6"/>
              </button>
            </div>
            <div className = "hidden lg:absolute lg:left-1/2 -translate-x-1/2 lg:flex lg:gap-x-12">
              {items.map((item, index) => {
                return (
                    <Link
                        to = {item.link}
                        key = {index}
                        className = {`relative group inline-block px-2 py-1 rounded-md text-sm leading-6 text-gray-900 focus:outline-none ${isCurrentTab(item.type, location.pathname) ? 'font-bold' : 'font-medium'}`}
                    >
                      <span className = "group-hover:text-violet-700">{item.name}</span>
                      <span
                          className = {`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full transition-all duration-300 group-hover:bg-violet-500 ${isCurrentTab(item.type, location.pathname) ? 'bg-violet-500' : ''}`}
                      ></span>
                    </Link>
                )
              })}
            </div>
            <Profile lang = {lang}/>
          </div>
        </nav>
        <Dialog open = {mobileMenuOpen} onClose = {setMobileMenuOpen} className = "lg:hidden">
          <div className = "fixed inset-0 z-10"/>
          <DialogPanel
              className = "fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
          >
            <div className = "flex items-center justify-between">
              <div className = "flex items-center gap-4">
                <a href = "/" className = "-m-1.5 p-1.5">
                  <img alt = "logo" src = "/favicon.svg" className = "h-8 w-8" width = "32" height = "32"/>
                </a>
                <Popover>
                  <PopoverButton className = "block data-[active]:text-violet-700 data-[hover]:text-violet-700">
                    <TranslateIcon className = "size-6 text-gray-900"/>
                  </PopoverButton>
                  <PopoverPanel
                      transition
                      anchor = "bottom"
                      className = "z-20 shadow-2xl divide-y divide-zinc-100 rounded-md bg-white text-sm transition duration-200 ease-in-out [--anchor-gap:var(--spacing-5)] data-[closed]:-translate-y-1 data-[closed]:opacity-0"
                  >
                    <Link
                        reloadDocument
                        to = "/zh/"
                        className = "block p-4 w-32 transition hover:bg-zinc-50"
                    >
                      中文
                    </Link>
                    <Link
                        reloadDocument
                        to = "/en/"
                        className = "block p-4 w-32 transition hover:bg-zinc-50"
                    >
                      English
                    </Link>
                    <Link
                        reloadDocument
                        to = "/jp/"
                        className = "block p-4 w-32 transition hover:bg-zinc-50"
                    >
                      日本語
                    </Link>
                  </PopoverPanel>
                </Popover>
              </div>
              <button
                  type = "button"
                  onClick = {() => setMobileMenuOpen(false)}
                  className = "-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className = "sr-only">Close menu</span>
                <XMarkIcon aria-hidden = "true" className = "h-6 w-6"/>
              </button>
            </div>
            <div className = "mt-6 flow-root">
              <div className = "-my-6 divide-y divide-gray-500/10">
                <div className = "space-y-2 py-6">
                  {items.map((item, index) => {
                    return (
                        <Link
                            reloadDocument
                            to = {item.link}
                            key = {index}
                            className = "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                    )
                  })}
                </div>
                <div className = "pt-8">
                  <Profile lang = {lang}/>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
  )
}
