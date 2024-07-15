import {useLoaderData, useOutletContext} from "@remix-run/react";
import {SupabaseClient} from "@supabase/supabase-js";
import {json, LoaderFunctionArgs} from "@remix-run/cloudflare";
import {useState} from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = new URL(request.url).origin;

  return json({ origin });
}

export default function Login() {
  const { supabase } = useOutletContext<{ supabase: SupabaseClient }>()
  const { origin } = useLoaderData<typeof loader>();
  const [email, setEmail] = useState('');

  const handleEmailLogin = async () => {
    await supabase.auth.signInWithOtp({
      email: 'jon@supabase.com',
      options: {
        emailRedirectTo: origin,
      }
    })
  }

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: origin,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
      <>
        <button onClick={handleEmailLogin}>Email Login</button>
        <button onClick={handleGitHubLogin}>GitHub Login</button>
        <button onClick={handleLogout}>Logout</button>
      </>
  )
}
