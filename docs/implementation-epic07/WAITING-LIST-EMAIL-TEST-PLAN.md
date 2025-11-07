# 📧 Waiting List Email Notification - Test Plan

**Feature:** Admin email notifications when users join the waiting list  
**Created:** 2025-11-07  
**Epic:** 07 - Subscription System

---

## 🎯 Feature Overview

When a user joins the waiting list for a paid subscription (Basic or Pro), all admin users receive an email notification with:
- User details (email, center name if available)
- Desired tier (Basic or Pro)
- Context (how they joined: limit reached, pricing page, dashboard, manual)
- Current contact usage (if applicable)
- CTA button to view the waiting list in admin dashboard

---

## 📋 Test Case 1: Email Sent - Limit Reached Context

**Objective:** Verify urgent email sent when user hits contact limit

**Prerequisites:**
- At least one admin user exists in the database
- RESEND_API_KEY configured in .env
- FROM_EMAIL configured in .env

**Steps:**
1. Log in as center with 14/15 contacts used
2. Send a jury request and have it accepted (reach 15/15)
3. Try to send another request
4. In the upgrade modal, click "Rejoindre la liste d'attente"
5. Select "Pro" tier
6. Submit the form
7. Check admin email inbox

**Expected Results:**
- ✅ Email received by all admins
- ✅ Subject: "🚨 Urgent - Utilisateur bloqué intéressé par Pro"
- ✅ Email shows:
  - User email
  - Center name
  - Desired tier: "Pro (15 contacts/mois)"
  - Context: "🚨 L'utilisateur a atteint sa limite de contacts (15 contacts utilisés)"
  - Urgency box with warning message
  - "Voir la liste d'attente" button linking to `/dashboard/admin/waiting-list`

---

## 📋 Test Case 2: Email Sent - Pricing Page Context

**Objective:** Verify email sent when user joins from pricing page

**Steps:**
1. Log in as center (or logged out)
2. Navigate to `/pricing`
3. Click "Rejoindre la liste d'attente" on Basic tier
4. Fill in email (if logged out)
5. Submit the form
6. Check admin email inbox

**Expected Results:**
- ✅ Email received by all admins
- ✅ Subject: "🎯 Nouvelle inscription liste d'attente - Basic"
- ✅ Email shows:
  - User email
  - Center name (if logged in)
  - Desired tier: "Basic (5 contacts/mois)"
  - Context: "💰 Inscription depuis la page tarifs"
  - Opportunity box (not urgent)
  - "Voir la liste d'attente" button

---

## 📋 Test Case 3: Email Sent - Dashboard CTA Context

**Objective:** Verify email sent when user joins from dashboard

**Steps:**
1. Log in as center
2. Go to `/dashboard`
3. In subscription widget, click upgrade CTA
4. Select "Pro" tier in waiting list form
5. Submit
6. Check admin email inbox

**Expected Results:**
- ✅ Email received by all admins
- ✅ Subject: "🎯 Nouvelle inscription liste d'attente - Pro"
- ✅ Context: "📊 Inscription depuis le tableau de bord"
- ✅ All other details present

---

## 📋 Test Case 4: Multiple Admins Receive Email

**Objective:** Verify all admin users receive the notification

**Prerequisites:**
- Create 2-3 admin users with different emails

**Steps:**
1. Verify multiple admins exist:
   ```sql
   SELECT email FROM users WHERE user_type = 'admin';
   ```
2. Have a user join the waiting list
3. Check all admin email inboxes

**Expected Results:**
- ✅ All admins receive the email
- ✅ Each email is personalized (if applicable)
- ✅ Console logs show: "Waiting list notifications sent: X/X"

---

## 📋 Test Case 5: Email Content Accuracy

**Objective:** Verify all email content is accurate

**Steps:**
1. Join waiting list with known data:
   - Email: test@example.com
   - Center: "Test Center"
   - Tier: Basic
   - Triggered by: pricing_page
2. Check received email

**Expected Results:**
- ✅ Email matches user data exactly
- ✅ Tier name correct: "Basic (5 contacts/mois)"
- ✅ Context icon and text correct
- ✅ No placeholder text or undefined values
- ✅ Button link is correct: `https://[domain]/dashboard/admin/waiting-list`

---

## 📋 Test Case 6: Email CTA Button Works

**Objective:** Verify the dashboard link works correctly

**Steps:**
1. Receive waiting list notification email
2. Click "Voir la liste d'attente" button
3. Verify redirect

**Expected Results:**
- ✅ Link opens in browser
- ✅ Redirects to `/dashboard/admin/waiting-list`
- ✅ If not logged in, redirects to login first
- ✅ After login, shows waiting list page
- ✅ New entry visible in the table

---

## 📋 Test Case 7: Email Styling and Rendering

**Objective:** Verify email renders correctly in different clients

**Steps:**
1. Send test email
2. Check rendering in:
   - Gmail (web)
   - Outlook (web)
   - Apple Mail (if available)
   - Mobile email client

**Expected Results:**
- ✅ Layout not broken
- ✅ Colors display correctly
- ✅ Button is clickable
- ✅ Text is readable
- ✅ Icons (emojis) display correctly

---

## 📋 Test Case 8: Email Failure Handling

**Objective:** Verify graceful handling if email fails

**Steps:**
1. Temporarily set invalid RESEND_API_KEY in .env
2. Have user join waiting list
3. Check API response
4. Check console logs

**Expected Results:**
- ✅ User still added to waiting list (success response)
- ✅ Error logged in console: "Failed to send waiting list notification"
- ✅ User sees success message
- ✅ Entry exists in database

---

## 📋 Test Case 9: No Admin Users

**Objective:** Verify handling when no admins exist

**Steps:**
1. Temporarily change all admin users to 'centre' type:
   ```sql
   UPDATE users SET user_type = 'centre' WHERE user_type = 'admin';
   ```
2. Have user join waiting list
3. Check console logs
4. Restore admin users:
   ```sql
   UPDATE users SET user_type = 'admin' WHERE email = 'admin@example.com';
   ```

**Expected Results:**
- ✅ User still added to waiting list
- ✅ Console warning: "No admin users found to send waiting list notification"
- ✅ No email sent (no crash)
- ✅ User sees success message

---

## 📋 Test Case 10: Email with Special Characters

**Objective:** Verify email handles special characters correctly

**Steps:**
1. Join waiting list with:
   - Center name: "École d'Été - Formation & Développement"
   - Email: test+special@example.com
2. Check received email

**Expected Results:**
- ✅ Special characters display correctly (é, è, &)
- ✅ Email address with + sign handled correctly
- ✅ No encoding issues
- ✅ French accents render properly

---

## 🔍 Database Verification

After each test, verify the waiting list entry:

```sql
SELECT 
  email,
  desired_tier,
  triggered_by,
  current_contacts_used,
  status,
  created_at
FROM subscription_waiting_list
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- Entry exists with correct data
- `status` is 'pending'
- `triggered_by` matches test context
- Timestamps are correct

---

## 📊 Console Log Verification

Check server logs for:

```
✅ Success logs:
- "Waiting list notification sent to admins"
- "Waiting list notifications sent: X/X"
- "Waiting list notification sent to admin@example.com"

❌ Error logs (if any):
- "Failed to send waiting list notification: [error details]"
- "No admin users found to send waiting list notification"
```

---

## 🧪 Manual Testing Checklist

- [ ] Test with limit_reached context
- [ ] Test with pricing_page context
- [ ] Test with dashboard_cta context
- [ ] Test with manual context (if applicable)
- [ ] Test with logged-in center user
- [ ] Test with logged-out visitor
- [ ] Test Basic tier selection
- [ ] Test Pro tier selection
- [ ] Verify email received by all admins
- [ ] Verify email content accuracy
- [ ] Verify CTA button works
- [ ] Test email rendering in multiple clients
- [ ] Verify graceful error handling
- [ ] Check database entries
- [ ] Review console logs

---

## 🚀 Quick Test Script

For rapid testing, use this sequence:

1. **Setup:**
   ```bash
   # Ensure admin user exists
   # Ensure RESEND_API_KEY is set
   # Start dev server: pnpm dev
   ```

2. **Test Limit Reached:**
   - Log in as center with contacts near limit
   - Reach limit and try to send request
   - Join waiting list from upgrade modal
   - Check admin email

3. **Test Pricing Page:**
   - Log out
   - Go to /pricing
   - Join waiting list for Basic
   - Check admin email

4. **Verify:**
   - Check database for entries
   - Verify both emails received
   - Click CTA buttons in emails
   - Confirm entries visible in admin dashboard

---

## 📧 Email Template Preview

To preview the email template without sending:

1. Create a test file:
   ```tsx
   // test-email-preview.tsx
   import { WaitingListNotification } from '@/components/emails/waiting-list-notification';
   
   export default function Preview() {
     return (
       <WaitingListNotification
         email="test@example.com"
         centerName="Test Center"
         desiredTier="pro"
         triggeredBy="limit_reached"
         currentContactsUsed={15}
         dashboardUrl="http://localhost:3000/dashboard/admin/waiting-list"
       />
     );
   }
   ```

2. Use React Email dev tools or render in browser

---

## ✅ Success Criteria

All tests pass when:
- ✅ Emails sent to all admins for each context
- ✅ Email content accurate and complete
- ✅ CTA button links work correctly
- ✅ Email renders well in major clients
- ✅ Graceful error handling
- ✅ Database entries correct
- ✅ Console logs show success
- ✅ No crashes or blocking errors

---

**Last Updated:** 2025-11-07  
**Status:** Ready for Testing  
**Next Steps:** Execute test cases and document results
