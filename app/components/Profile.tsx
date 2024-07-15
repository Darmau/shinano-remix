import {Session, SupabaseClient, User} from "@supabase/supabase-js";
import {useOutletContext} from "@remix-run/react";

export default function Profile ({session}: { session: Session }) {
  const { supabase } = useOutletContext<{ supabase: SupabaseClient }>()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
      <div className="flex items-end gap-0 flex-col">
        <h3 className="text-sm font-medium">娜娜</h3>
        <p className="text-sm text-gray-600">{JSON.stringify(session)}</p>
        <button onClick={handleLogout}>Signout</button>
      </div>
  )
}
