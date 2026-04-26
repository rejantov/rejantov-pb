import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/supabase/admin'
import { getSupabaseConfig } from '@/lib/supabase/config'

export async function updateSession(request: NextRequest) {
  // Only run auth checks for admin routes — avoids a Supabase round-trip on every public request
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })
  const { url, publishableKey } = getSupabaseConfig()

  const supabase = createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.search = ''

  if (!user) {
    return NextResponse.redirect(loginUrl)
  }

  if (!isAdminEmail(user.email)) {
    await supabase.auth.signOut()
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  // If the browser session ended (tab closed), admin-active cookie is gone.
  // Sign the user out so they must re-authenticate.
  const adminActive = request.cookies.get('admin-active')
  if (!adminActive) {
    await supabase.auth.signOut()
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
