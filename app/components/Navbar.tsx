import { useState } from 'react'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import NavbarText from '~/locales/navbar'
import getLanguageLabel from "~/utils/getLanguageLabel";
import {Link} from "@remix-run/react";
import {json} from "@remix-run/cloudflare";
import Profile from "~/components/Profile";
import {supabaseBrowserClient} from "~/utils/supabase.client";
import {Session} from "@supabase/supabase-js";

const products = [
  { name: 'Analytics', description: 'Get a better understanding of your traffic', href: '#', icon: ChartPieIcon },
  { name: 'Engagement', description: 'Speak directly to your customers', href: '#', icon: CursorArrowRaysIcon },
  { name: 'Security', description: 'Your customers’ data will be safe and secure', href: '#', icon: FingerPrintIcon },
  { name: 'Integrations', description: 'Connect with third-party tools', href: '#', icon: SquaresPlusIcon },
  { name: 'Automations', description: 'Build strategic funnels that will convert', href: '#', icon: ArrowPathIcon },
]

const company = [
  { name: 'About us', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export const loader = async () => {
  const supabase = supabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return json({
    user,
  })
}

interface Props {
  lang: string
  session?: Session | null
}

export default function Navbar({lang, session}: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const label = getLanguageLabel(NavbarText, lang)

  return (
      <header className="bg-white">
        <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">{lang}</span>
              <img alt="" src="/favicon.svg" className="h-8 w-auto" />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <PopoverGroup className="hidden lg:flex lg:gap-x-12">
            <Popover className="relative">
              <PopoverButton className="px-2 py-1 rounded-md flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 focus:outline-none">
                {label.article}
                <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
              </PopoverButton>

              <PopoverPanel
                  transition
                  className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="p-4">
                  {products.map((item) => (
                      <div
                          key={item.name}
                          className="group relative flex gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50"
                      >
                        <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                          <item.icon aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-indigo-600" />
                        </div>
                        <div className="flex-auto">
                          <a href={item.href} className="block font-semibold text-gray-900">
                            {item.name}
                            <span className="absolute inset-0" />
                          </a>
                          <p className="mt-1 text-gray-600">{item.description}</p>
                        </div>
                      </div>
                  ))}
                </div>
              </PopoverPanel>
            </Popover>

            <a href="/photos/all/1" className="px-2 py-1 rounded-md text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 focus:outline-none">
              {label.photography}
            </a>
            <a href="/thoughts/1" className="px-2 py-1 rounded-md text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 focus:outline-none">
              {label.thought}
            </a>

            <Popover className="relative">
              <PopoverButton className="px-2 py-1 rounded-md flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50 focus:outline-none">
                {label.about}
                <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400" />
              </PopoverButton>

              <PopoverPanel
                  transition
                  className="absolute -left-8 top-full z-10 mt-3 w-56 rounded-xl bg-white p-2 shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
              >
                {company.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                ))}
              </PopoverPanel>
            </Popover>
          </PopoverGroup>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {session ? (
                <Profile session={session} />
                ) : (
                <div className = "flex flex-1 items-center justify-end gap-x-6">
                  <Link
                      to = {`${lang}/login`}
                      className = "hidden lg:block lg:text-sm lg:font-semibold lg:leading-6 lg:text-gray-900"
                  >
                    {label.login}
                  </Link>
                  <Link
                      to = {`${lang}/signup`}
                      className = "rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {label.signup}
                  </Link>
                </div>
            )}
          </div>
        </nav>
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
                    className="h-8 w-auto"
                />
              </a>
              <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      {label.article}
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2">
                      {[...products].map((item) => (
                          <DisclosureButton
                              key={item.name}
                              as="a"
                              href={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          >
                            {item.name}
                          </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>

                  <a
                      href="/"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {label.photography}
                  </a>
                  <a
                      href="/"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {label.thought}
                  </a>

                  <Disclosure as="div" className="-mx-3">
                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      {label.about}
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5 flex-none group-data-[open]:rotate-180" />
                    </DisclosureButton>
                    <DisclosurePanel className="mt-2 space-y-2">
                      {company.map((item) => (
                          <DisclosureButton
                              key={item.name}
                              as="a"
                              href={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          >
                            {item.name}
                          </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                </div>
                <div className="flex gap-4 justify-between my-8">
                  <Link
                      to={`${lang}/signup`}
                      className="flex-1 text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {label.signup}
                  </Link>
                  <Link
                      to={`${lang}/login`}
                      className="flex-1 text-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    {label.login}
                  </Link>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
  )
}
