import {User} from "@supabase/supabase-js";

export default function Profile ({user}: { user: User }) {

  return (
      <div className="flex items-end gap-0 flex-col">
        <h3 className="text-sm font-medium">{user.user_metadata.name}</h3>
        <p className="text-sm text-gray-600">{user.user_metadata.email}</p>
      </div>
  )
}
