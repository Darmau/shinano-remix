import {SupabaseClient, User} from "@supabase/supabase-js";
import {useOutletContext} from "@remix-run/react";

export default function Profile ({user}: { user: User }) {
  const { supabase } = useOutletContext<{ supabase: SupabaseClient }>()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
      <div className="flex items-end gap-0 flex-col">
        <h3 className="text-sm font-medium">{user.user_metadata.name}</h3>
        <p className="text-sm text-gray-600">{user.user_metadata.email}</p>
        <button onClick={handleLogout}>Signout</button>
      </div>
  )
}
