import {useContext, useState} from 'react'
import {Dialog, DialogPanel,} from '@headlessui/react'
import {Bars3Icon, XMarkIcon,} from '@heroicons/react/24/outline'
import NavbarItems from '~/locales/navbar'
import {Link, useLocation} from "@remix-run/react";
import Profile from "~/components/Profile";
import {Config} from "~/root";
import SubNavItems from "~/locales/subnav";


export default function Navbar() {
  const {lang} = useContext(Config);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navbarItems = NavbarItems(lang);

  const location = useLocation();
  const current = location.pathname.split('/')[2] ?? 'articles';

  const subnavItems = SubNavItems(lang, current);

  return (
      <header className = "relative isolate z-10">
        <nav aria-label = "Global" className = "border-b">
          <div className="max-w-8xl mx-auto flex items-center justify-between p-6 lg:px-8">
            <div className = "hidden lg:flex">
              <Link to = {`/${lang}`} className = "-m-1.5 p-1.5">
                <span className = "sr-only">Logo</span>
                <img alt = "" src = "/favicon.svg" className = "h-8 w-auto"/>
              </Link>
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
              {navbarItems.map((item, index) => {
                return (
                    <Link
                        to = {item.link}
                        key = {index}
                        className = {`relative group inline-block px-2 py-1 rounded-md text-sm leading-6 text-gray-900 focus:outline-none ${location.pathname === item.link ? 'font-bold' : 'font-medium'}`}
                    >
                      <span className="group-hover:text-violet-700">{item.name}</span>
                      <span
                          className = {`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full transition-all duration-300 group-hover:bg-violet-500 ${location.pathname === item.link ? 'bg-violet-500' : ''}`}
                      ></span>
                    </Link>
                )
              })}
            </div>
            <Profile/>
          </div>
        </nav>
        <div className = "flex gap-8 justify-center p-4 border-b">
          {subnavItems.map((item, index) => {
            return (
                <Link
                    className={`text-sm hover:text-violet-700 hover:font-medium ${location.pathname === item.link ? 'font-bold text-zinc-700' : 'text-zinc-500'}`}
                    to = {item.link}
                    key = {index}
                >
                  {item.name}
                </Link>
            )
          })}
        </div>
        <Dialog open = {mobileMenuOpen} onClose = {setMobileMenuOpen} className = "lg:hidden">
          <div className = "fixed inset-0 z-10"/>
          <DialogPanel
              className = "fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
          >
            <div className = "flex items-center justify-between">
              <a href = "/" className = "-m-1.5 p-1.5">
                <span className = "sr-only">Your Company</span>
                <img
                    alt = ""
                    src = "https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                    className = "h-8 w-auto"
                />
              </a>
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
                  {navbarItems.map((item, index) => {
                    return (
                        <Link
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
                  <Profile/>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
  )
}
