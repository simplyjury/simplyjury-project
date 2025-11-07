# 🚀 Migration Execution Guide - Epic 07 Step 01

## 📋 Pre-Execution Checklist

Before running the migration, ensure:

- [ ] You have admin access to Supabase project `vbnnjwgfbadvqavqnlhh`
- [ ] You have a backup of the database (or can restore from Supabase point-in-time recovery)
- [ ] You're executing in the correct environment (dev/staging before production)
- [ ] No active deployments or critical operations are running

---

## 🎯 Execution Steps

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `vbnnjwgfbadvqavqnlhh`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Execute the Migration

1. Open the file: `/docs/implementation-epic07/migration-step01-subscription-system.sql`
2. Copy the **entire contents** of the file
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Execution

The script includes automatic verification at the end. Look for these messages:

```
✅ All required columns exist in training_centers
✅ Table subscription_waiting_list exists
✅ Table contact_limit_history exists
✅ Function should_reset_contact_period exists
✅ Function get_effective_contact_limit exists
```

You should also see a summary table showing training centers by tier.

### Step 4: Manual Verification (Optional)

Run these queries to double-check:

```sql
-- Check training_centers columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'training_centers'
AND column_name IN (
  'subscription_start_date',
  'contacts_used_current_period',
  'contacts_limit',
  'first_accepted_contact_date',
  'premium_access_granted_until'
)
ORDER BY column_name;

-- Check new tables
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('subscription_waiting_list', 'contact_limit_history')
AND table_schema = 'public';

-- Test helper functions
SELECT get_effective_contact_limit(1) as effective_limit;
SELECT should_reset_contact_period(1) as needs_reset;
```

---

## 📊 What This Migration Does

### 1. **Extends `training_centers` Table**
Adds 12 new columns for subscription management:
- Subscription tracking (tier, start date, end date)
- Contact limits (used, limit, reset dates)
- Admin overrides (manual limits, premium access)

### 2. **Creates `subscription_waiting_list` Table**
Stores users interested in paid plans (MVP phase):
- Email + desired tier
- Status tracking (pending, contacted, converted, declined)
- Context (how they joined, current usage)

### 3. **Creates `contact_limit_history` Table**
Audit trail for all subscription events:
- Contact usage tracking
- Admin actions (refunds, overrides)
- Tier changes
- Before/after snapshots

### 4. **Creates Helper Functions**
- `should_reset_contact_period(center_id)` - Checks if 30 days passed
- `get_effective_contact_limit(center_id)` - Returns limit with overrides

### 5. **Migrates Existing Data**
- Sets proper limits based on current tier
- Calculates current period usage from last 30 days
- Initializes subscription_start_date

### 6. **Creates Performance Indexes**
- Optimizes queries on subscription_tier, premium_access, etc.

---

## 🔍 Expected Results

### Training Centers Table
All existing centers should have:
- `subscription_tier` = 'gratuit' (default)
- `contacts_limit` = 1
- `contacts_used_current_period` = (count of accepted requests in last 30 days)
- `subscription_start_date` = their `created_at` date

### New Tables
- `subscription_waiting_list`: Empty (0 rows)
- `contact_limit_history`: Empty (0 rows)

### Functions
Both helper functions should be callable and return appropriate values.

---

## ⚠️ Troubleshooting

### Error: "column already exists"
**Cause:** Migration was partially run before.
**Solution:** The script uses `IF NOT EXISTS` clauses, so it's safe to re-run. If specific columns exist, those additions will be skipped.

### Error: "relation does not exist"
**Cause:** Referenced table (users, jury_requests) doesn't exist.
**Solution:** Verify you're running in the correct database. Check that core tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('users', 'training_centers', 'jury_requests')
AND table_schema = 'public';
```

### Error: "constraint already exists"
**Cause:** Constraint was added in a previous run.
**Solution:** The script checks for existing constraints. This is safe to ignore.

### Verification Checks Fail
**Cause:** Migration didn't complete successfully.
**Solution:** 
1. Check the error messages in the SQL editor
2. Scroll up to find the specific SQL statement that failed
3. Fix the issue and re-run the entire script

---

## 📝 Post-Migration Tasks

After successful migration:

1. **Update Drizzle Schema**
   ```bash
   # Edit lib/db/schema.ts to add new fields and tables
   # See Epic07-step01-database-schema.md for TypeScript definitions
   ```

2. **Generate TypeScript Types**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Verify in Supabase Dashboard**
   - Go to **Table Editor**
   - Check `training_centers` has new columns
   - Verify `subscription_waiting_list` and `contact_limit_history` exist

4. **Test Helper Functions**
   ```sql
   -- Test with a real center ID
   SELECT 
     id,
     subscription_tier,
     contacts_limit,
     get_effective_contact_limit(id) as effective_limit,
     should_reset_contact_period(id) as needs_reset
   FROM training_centers
   LIMIT 5;
   ```

5. **Document Migration**
   - Note the execution date and time
   - Record any issues encountered
   - Update team on completion

---

## 🎯 Next Steps

Once migration is verified:

1. ✅ **Step 01 Complete** - Database schema ready
2. ➡️ **Proceed to Step 02** - Create backend services
   - `lib/services/subscription-service.ts`
   - `lib/services/contact-limit-service.ts`
   - `lib/services/waiting-list-service.ts`

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Supabase Logs**: Dashboard → Logs → Postgres Logs
2. **Review Error Messages**: Copy the full error for debugging
3. **Rollback if Needed**: Supabase has point-in-time recovery
4. **Test in Isolation**: Run problematic sections separately

---

## 📊 Migration Metadata

- **Epic**: 07 - Subscription System
- **Step**: 01 - Database Schema
- **File**: `migration-step01-subscription-system.sql`
- **Estimated Duration**: 2-5 minutes
- **Rollback Strategy**: Supabase point-in-time recovery (if needed)
- **Breaking Changes**: None (additive only)
- **Data Loss Risk**: None (no deletions)

---

**Ready to execute?** Follow the steps above and verify each checkpoint! ✨
