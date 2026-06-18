import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL ou Anon Key não configurados.')
}

function getAllCookies() {
  if (typeof document === 'undefined') return []
  return document.cookie.split(';').reduce((acc, c) => {
    const [name, ...rest] = c.trim().split('=')
    if (name) acc.push({ name: name.trim(), value: rest.join('=') || '' })
    return acc
  }, [])
}

function setCookie(name, value, options = {}) {
  if (typeof document === 'undefined') return
  let cookie = `${name}=${value}`
  if (options.path) cookie += `; Path=${options.path}`
  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`
  if (options.expires) cookie += `; Expires=${options.expires}`
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
  if (options.secure) cookie += `; Secure`
  if (options.httpOnly) cookie += `; HttpOnly`
  document.cookie = cookie
}

// Browser client — agora sincroniza sessão para cookie de verdade
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  cookies: {
    getAll() { return getAllCookies() },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => setCookie(name, value, options))
    },
  },
})

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey, {
  cookies: {
    getAll() { return getAllCookies() },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => setCookie(name, value, options))
    },
  },
})

// Server client — getServerSideProps / API routes
export const createServerSupabaseClient = (context) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name) => context.req.cookies[name],
      set: (name, value, options) => {
        context.res.setHeader('Set-Cookie', `${name}=${value}; ${serializeOptions(options)}`)
      },
      remove: (name, options) => {
        context.res.setHeader('Set-Cookie', `${name}=; ${serializeOptions(options)}`)
      },
    },
  })
}

function serializeOptions(options) {
  const opts = []
  if (options.maxAge) opts.push(`Max-Age=${options.maxAge}`)
  if (options.expires) opts.push(`Expires=${options.expires.toUTCString()}`)
  if (options.path) opts.push(`Path=${options.path}`)
  if (options.domain) opts.push(`Domain=${options.domain}`)
  if (options.sameSite) opts.push(`SameSite=${options.sameSite}`)
  if (options.secure) opts.push('Secure')
  if (options.httpOnly) opts.push('HttpOnly')
  return opts.join('; ')
}