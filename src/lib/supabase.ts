import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Debug logging
  console.log('🔍 Supabase Config Check:')
  console.log('  URL:', url ? 'SET ✅' : 'MISSING ❌')
  console.log('  KEY:', key ? 'SET ✅' : 'MISSING ❌')
  console.log('  Configured:', !!(url && key && url !== 'https://placeholder.supabase.co' && !key.includes('placeholder')))
  
  return !!(url && key && url !== 'https://placeholder.supabase.co' && !key.includes('placeholder'))
}

function getSupabaseClient(): SupabaseClient | null {
  // Return null if not configured - functions will handle this
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - returning null client')
    return null
  }

  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log('✅ Creating Supabase client with URL:', supabaseUrl.substring(0, 30) + '...')
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Create a Proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    
    // If client is null (not configured), return a mock chain that returns empty results
    if (!client) {
      if (prop === 'from') {
        // Create a mock query builder that supports all chaining methods
        return () => {
          const mockQuery = {
            select: () => mockQuery,
            eq: () => mockQuery,
            neq: () => mockQuery,
            order: () => mockQuery,
            limit: () => Promise.resolve({ data: [], error: null }),
            range: () => Promise.resolve({ data: [], error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
            then: (onResolve: any) => Promise.resolve({ data: [], error: null }).then(onResolve)
          }
          return mockQuery
        }
      }
      if (prop === 'auth') {
        return {
          getUser: () => Promise.resolve({ data: { user: null }, error: null })
        }
      }
      // For other properties, return a no-op function
      return () => Promise.resolve({ data: null, error: null })
    }
    
    const value = client[prop as keyof SupabaseClient]
    
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  }
})






