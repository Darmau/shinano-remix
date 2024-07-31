import getLanguageLabel from "~/utils/getLanguageLabel";
import SignupText from '~/locales/signup'
import {useOutletContext} from "@remix-run/react";

export default function EmailLogin () {
  const {lang} = useOutletContext<{lang: string}>();
  const label = getLanguageLabel(SignupText, lang);
  return (
      <div className = "space-y-6">
        <div>
          <label htmlFor = "email" className = "block text-sm font-medium leading-6 text-gray-900">
            {label.email}
          </label>
          <div className = "mt-2">
            <input
                id = "email"
                name = "email"
                type = "email"
                autoComplete = "email"
                className = "block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <input type="hidden" value={lang} name="lang"/>
        <div>
          <label htmlFor = "password" className = "block text-sm font-medium leading-6 text-gray-900">
            {label.password}
          </label>
          <div className = "mt-2">
            <input
                id = "password"
                name = "password"
                type = "password"
                autoComplete = "current-password"
                className = "block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
              type = "submit"
              name = "intent"
              value = "email"
              className = "flex w-full justify-center rounded-md bg-violet-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            {label.sign_in}
          </button>
        </div>
      </div>
  )
}
