# Admin Role System Setup Guide

## Overview

The admin role system supports multiple methods for managing admin access:

1. **Environment Variable** (Development/No Login) - Quick setup
2. **User Metadata** (Quick Setup) - Set role in user metadata
3. **Database Table** (Production) - Full admin management system

---

## Quick Start (No Login Required)

### Option 1: Bypass Admin Check (Development Only)

Add to `.env.local`:
```env
NEXT_PUBLIC_ADMIN_BYPASS=true
```

⚠️ **Warning:** Only use this in development! This allows anyone to access admin panel.

### Option 2: Set Admin User IDs (Environment Variable)

Add to `.env.local`:
```env
NEXT_PUBLIC_ADMIN_USER_IDS=user-id-1,user-id-2,user-id-3
```

Replace `user-id-1`, etc. with actual Supabase user IDs.

---

## Production Setup (With Database)

### Step 1: Create Admin Users Table

Run the SQL in `supabase-admin-schema.sql` in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of supabase-admin-schema.sql
```

This creates:
- `admin_users` table
- Row Level Security (RLS) policies
- Indexes for performance
- Auto-update triggers

### Step 2: Add First Admin User

After creating the table, you can add your first admin user:

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Run:
```sql
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'your-user-id-here',
  'admin@example.com',
  'super_admin',
  true
);
```

**Option B: Via Code (after login is implemented)**
```typescript
import { addAdminUser } from '@/lib/supabase/admin'

const result = await addAdminUser(
  userId,
  'admin@example.com',
  'super_admin'
)
```

---

## Admin Roles

- **`admin`**: Can access admin panel, manage products/orders
- **`super_admin`**: Can do everything admin can, plus manage other admin users

---

## Functions Available

### Check Admin Status
```typescript
import { isAdmin, isSuperAdmin } from '@/lib/supabase/admin'

// Check if current user is admin
const admin = await isAdmin()

// Check if current user is super admin
const superAdmin = await isSuperAdmin()
```

### Check Specific User
```typescript
import { isUserAdmin } from '@/lib/supabase/admin'

const isAdmin = await isUserAdmin('user-id-here')
```

### Manage Admin Users (Super Admin Only)
```typescript
import { 
  addAdminUser, 
  removeAdminUser, 
  getAllAdminUsers 
} from '@/lib/supabase/admin'

// Add admin
await addAdminUser(userId, 'email@example.com', 'admin')

// Remove admin
await removeAdminUser(userId)

// Get all admins
const { data, error } = await getAllAdminUsers()
```

---

## How It Works

The system checks admin status in this order:

1. **Environment Bypass** → If `NEXT_PUBLIC_ADMIN_BYPASS=true`, allow access
2. **Environment Variable IDs** → Check if user ID is in `NEXT_PUBLIC_ADMIN_USER_IDS`
3. **User Metadata** → Check if `user.user_metadata.role === 'admin'`
4. **Database Table** → Check `admin_users` table for active admin

---

## Security Notes

- **RLS Policies**: The `admin_users` table has Row Level Security enabled
- **Super Admin Only**: Only super admins can add/remove other admins
- **Environment Variables**: Never commit `.env.local` to git
- **Production**: Always use database table method in production

---

## Troubleshooting

### "No authenticated user" error
- Make sure user is logged in via Supabase Auth
- Check Supabase client configuration

### "Table not found" error
- Run the SQL from `supabase-admin-schema.sql` in Supabase SQL Editor
- Wait a few seconds for table to be created

### Admin check always returns false
- Check environment variables are set correctly
- Verify user ID matches in database
- Check RLS policies allow read access

---

## Next Steps

1. ✅ Admin role system is set up
2. ⏭️ When you add user login, the system will automatically work
3. ⏭️ You can manage admin users via admin panel (to be built)

