import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL ou Anon Key não configurados.')
}

// Cliente singleton no browser — compatível com todo código existente (AuthContext, hooks, etc)
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

// Factory para criar novo browser client (se algum componente precisar de instância isolada)
export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey)

// Cliente no servidor — usa cookie HTTP, acessível em getServerSideProps e API routes
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