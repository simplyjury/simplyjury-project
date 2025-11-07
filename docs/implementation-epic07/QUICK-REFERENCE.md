# 🚀 Epic 07 - Quick Reference Card

## 📊 Subscription Tiers

| Tier | Contacts/Month | Status |
|------|----------------|--------|
| **Gratuit** | 1 | Default for all centers |
| **Basic** | 5 | Waiting list only (MVP) |
| **Pro** | 15 | Waiting list only (MVP) |

---

## 🔑 Key Concepts

### 30-Day Rolling Window
- Period starts on **first accepted contact**
- Counter resets automatically after 30 days
- Tracked per training center

### Limit Priority (Highest to Lowest)
1. **Manual Override** - Admin-set limit
2. **Premium Access** - Pro-level access (15 contacts)
3. **Subscription Tier** - Based on tier (1/5/15)

---

## 📍 Important URLs

### User Pages
- Dashboard: `/dashboard`
- Pricing: `/pricing`
- Search: `/dashboard/search`

### Admin Pages
- Subscriptions: `/dashboard/admin/subscriptions`
- Waiting List: `/dashboard/admin/waiting-list`

---

## 🔌 API Endpoints

### User Endpoints
```
GET  /api/subscription/status
GET  /api/subscription/stats
POST /api/subscription/waiting-list
GET  /api/subscription/waiting-list
```

### Admin Endpoints
```
POST  /api/admin/subscription/grant-premium
POST  /api/admin/subscription/set-limit
POST  /api/admin/subscription/refund-contact
GET   /api/admin/waiting-list
PATCH /api/admin/waiting-list/[id]/contact
GET   /api/admin/waiting-list/stats
```

---

## 🗄️ Database Tables

### Main Tables
1. **training_centers** - Extended with 12 subscription fields
2. **subscription_waiting_list** - MVP waiting list
3. **contact_limit_history** - Complete audit trail

### Key Fields
```sql
-- training_centers
subscription_tier              -- gratuit/basic/pro
contacts_used_current_period   -- Current usage
contacts_limit                 -- Max allowed
first_accepted_contact_date    -- Period start
premium_access_granted_until   -- Premium expiry
manual_contact_limit_override  -- Admin override
```

---

## 🛠️ Admin Actions

### Grant Premium Access
1. Go to `/dashboard/admin/subscriptions`
2. Click "Premium" button
3. Set expiration date (default: 30 days)
4. Enter reason
5. Submit → Center gets 15 contacts/month

### Set Manual Limit
1. Go to `/dashboard/admin/subscriptions`
2. Click "Limite" button
3. Enter new limit (any number ≥ 0)
4. Optionally set expiration
5. Enter reason
6. Submit → Limit updated

### Refund Contact
1. Go to `/dashboard/admin/subscriptions`
2. Click "Rembourser" button
3. Select request to refund
4. Enter reason
5. Submit → Counter decremented

---

## 🔍 Troubleshooting

### User Can't Create Request
**Check:**
1. Current contacts used vs. limit
2. Premium access status
3. Manual override status
4. Period start date (30-day window)

**Solution:**
- Grant premium access
- Set manual limit override
- Refund a contact
- Wait for period reset

### Counter Not Incrementing
**Check:**
1. Request status (must be "accepted")
2. API logs for errors
3. `contact_limit_history` table

**Solution:**
- Verify jury accepted the request
- Check API endpoint logs
- Manually increment if needed

### Period Not Resetting
**Check:**
1. `first_accepted_contact_date`
2. Current date vs. period start + 30 days
3. `last_contact_reset_date`

**Solution:**
- Admin can manually reset period
- Use `SubscriptionService.resetContactPeriod()`

---

## 📝 Common Queries

### Check Center Subscription
```sql
SELECT 
  id,
  name,
  subscription_tier,
  contacts_used_current_period,
  contacts_limit,
  first_accepted_contact_date,
  premium_access_granted_until,
  manual_contact_limit_override
FROM training_centers
WHERE id = ?;
```

### View Audit Trail
```sql
SELECT 
  event_type,
  contacts_used_before,
  contacts_used_after,
  reason,
  created_at
FROM contact_limit_history
WHERE training_center_id = ?
ORDER BY created_at DESC
LIMIT 10;
```

### Check Waiting List
```sql
SELECT 
  email,
  desired_tier,
  status,
  triggered_by,
  created_at
FROM subscription_waiting_list
WHERE status = 'pending'
ORDER BY created_at ASC;
```

---

## 🎯 Quick Wins

### For Support Team
- View all subscriptions in admin panel
- Grant premium access in 3 clicks
- Refund contacts for disputes
- Export waiting list to CSV

### For Users
- See usage in dashboard widget
- Get upgrade prompts when needed
- Join waiting list easily
- Clear feedback on limits

### For Developers
- Complete TypeScript types
- Service layer for business logic
- Comprehensive audit trail
- Mobile-responsive UI

---

## 📞 Need Help?

### Documentation
- Implementation Checklist: `IMPLEMENTATION-CHECKLIST.md`
- Step Summaries: `STEP01-06-COMPLETION-SUMMARY.md`
- Final Summary: `EPIC07-FINAL-SUMMARY.md`
- This File: `QUICK-REFERENCE.md`

### Code Locations
- Services: `/lib/services/`
- API Routes: `/app/api/`
- Components: `/components/subscription/` and `/components/admin/`
- Database: `/lib/db/schema.ts`

### Testing
- Manual testing checklist in Step 06 summary
- Build command: `pnpm build`
- Dev server: `pnpm dev`

---

**Last Updated:** 2025-11-07  
**Version:** 1.0 (MVP)  
**Status:** ✅ Production Ready
