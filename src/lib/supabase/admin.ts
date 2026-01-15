import { supabase } from '../supabase'

/**
 * Admin Role System
 * 
 * Supports multiple methods for admin checking:
 * 1. Environment variable (NEXT_PUBLIC_ADMIN_USER_IDS) - for development/no login
 * 2. User metadata (user.user_metadata.role === 'admin') - quick setup
 * 3. Database table (admin_users) - production ready
 */

/**
 * Check if current user is an admin
 * Checks in order: env vars -> user metadata -> database table
 */
export async function isAdmin(): Promise<boolean> {
  try {
    // Method 1: Check environment variable (for development/no login)
    // If NEXT_PUBLIC_ADMIN_BYPASS is set to 'true', allow all access
    if (process.env.NEXT_PUBLIC_ADMIN_BYPASS === 'true') {
      console.log('Admin access: Bypassed (development mode)')
      return true
    }

    // Check if user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      // No user logged in - check if we have env var admin IDs
      const envAdminIds = getAdminUserIdsFromEnv()
      if (envAdminIds.length > 0) {
        // In development, might allow access via env var
        // For now, return false if no user
        return false
      }
      return false
    }

    // Method 2: Check environment variable admin IDs
    const envAdminIds = getAdminUserIdsFromEnv()
    if (envAdminIds.includes(user.id)) {
      return true
    }

    // Method 3: Check user metadata
    const userRole = user.user_metadata?.role
    if (userRole === 'admin' || userRole === 'super_admin') {
      return true
    }

    // Method 4: Check admin_users database table
    try {
      const { data: adminUser, error: dbError } = await supabase
        .from('admin_users')
        .select('id, role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!dbError && adminUser) {
        return true
      }
    } catch (dbError) {
      // Table might not exist yet, that's okay
      console.log('admin_users table not found or error:', dbError)
    }

    return false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Check if current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return false
    }

    // Check user metadata
    const userRole = user.user_metadata?.role
    if (userRole === 'super_admin') {
      return true
    }

    // Check database table
    try {
      const { data: adminUser, error: dbError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!dbError && adminUser && adminUser.role === 'super_admin') {
        return true
      }
    } catch (dbError) {
      // Table might not exist yet
    }

    return false
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

/**
 * Get list of admin user IDs from environment variable
 */
function getAdminUserIdsFromEnv(): string[] {
  const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || []
  return adminIds.map(id => id.trim()).filter(Boolean)
}

/**
 * Get list of admin user IDs (from env or database)
 */
export async function getAdminUserIds(): Promise<string[]> {
  // First, get from environment variable
  const envAdminIds = getAdminUserIdsFromEnv()
  
  // Then, try to get from database
  try {
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('is_active', true)

      if (!error && adminUsers) {
        const dbAdminIds = adminUsers.map(au => au.user_id)
        // Combine and deduplicate
        const combined = [...envAdminIds, ...dbAdminIds]
        return Array.from(new Set(combined))
      }
  } catch (error) {
    // Table might not exist yet
    console.log('Could not fetch admin users from database:', error)
  }

  return envAdminIds
}

/**
 * Check if a specific user ID is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  // Check environment variable
  const envAdminIds = getAdminUserIdsFromEnv()
  if (envAdminIds.includes(userId)) {
    return true
  }

  // Check database
  try {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!error && adminUser) {
      return true
    }
  } catch (error) {
    // Table might not exist yet
  }

  return false
}

/**
 * Add a user as admin (requires super admin or env var setup)
 */
export async function addAdminUser(
  userId: string,
  email: string,
  role: 'admin' | 'super_admin' = 'admin'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if current user is super admin
    const isSuper = await isSuperAdmin()
    if (!isSuper && process.env.NEXT_PUBLIC_ADMIN_BYPASS !== 'true') {
      return { success: false, error: 'Unauthorized: Super admin access required' }
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      return { success: false, error: 'User is already an admin' }
    }

    // Get current user ID for created_by
    const { data: { user } } = await supabase.auth.getUser()
    const createdBy = user?.id || null

    // Insert new admin user
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: email,
        role: role,
        is_active: true,
        created_by: createdBy,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add admin user' }
  }
}

/**
 * Remove a user from admin (requires super admin)
 */
export async function removeAdminUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if current user is super admin
    const isSuper = await isSuperAdmin()
    if (!isSuper && process.env.NEXT_PUBLIC_ADMIN_BYPASS !== 'true') {
      return { success: false, error: 'Unauthorized: Super admin access required' }
    }

    // Delete admin user
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove admin user' }
  }
}

/**
 * Get all admin users (requires admin access)
 */
export async function getAllAdminUsers(): Promise<{
  success: boolean
  data?: Array<{
    id: string
    user_id: string
    email: string
    role: string
    is_active: boolean
    created_at: string
  }>
  error?: string
}> {
  try {
    // Check if current user is admin
    const admin = await isAdmin()
    if (!admin) {
      return { success: false, error: 'Unauthorized: Admin access required' }
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, user_id, email, role, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch admin users' }
  }
}

