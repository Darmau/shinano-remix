import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import {supabaseServerClient} from "~/utils/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = supabaseServerClient(request)
    await supabase.auth.exchangeCodeForSession(code)
  }

  return redirect('/', {
    headers: response.headers,
  })
}
