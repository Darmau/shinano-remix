import type {ActionFunctionArgs} from '@remix-run/cloudflare'
import {redirect} from '@remix-run/cloudflare'
import {createRemoteClient} from '~/utils/supabase.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as 'magiclink';
  if (token_hash) {
    const supabase = createRemoteClient(request)
    const { error } = await supabase.auth.verifyOtp({token_hash, type})
    if (error) {
      return redirect('/login')
    }
    return redirect('/')
  }
  return new Response('Authentication faild', {
    status: 400,
  })
}
