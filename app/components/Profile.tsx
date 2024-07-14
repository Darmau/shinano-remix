import {User} from "@supabase/supabase-js";
import {Popover, PopoverButton} from "@headlessui/react";

export default function Profile ({user}: { user: User }) {

  return (
      <Popover>
        <PopoverButton className="block text-sm/6 font-semibold text-zinc-800 focus:outline-none data-[active]:text-black data-[hover]:text-indigo-700 data-[focus]:outline-1 data-[focus]:outline-white">
          <h3>{user.user_metadata.name}</h3>
          <p>{user.user_metadata.email}</p>
        </PopoverButton>
      </Popover>
  )
}
