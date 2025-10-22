# Epic 07: Subscription Tiers & Contact Limits - Implementation Overview

## 🎯 Epic Objective
Implement a freemium subscription model with contact limits for training centers, preparing for future Stripe integration while building a waiting list for paid tiers.

---

## 📋 Business Requirements Summary

### Contact Limits by Tier:
- **Gratuit (Free)**: 1 contact per 30-day rolling period
- **Basic**: 5 contacts per 30-day rolling period (39€/month)
- **Pro**: 15 contacts per 30-day rolling period (89€/month)

### Key Business Rules:
1. **Contact Counting**: Only count when jury **accepts** request (not on send)
2. **Period Reset**: 30-day rolling window from first accepted contact
3. **Waiting List**: Capture interest before Stripe integration
4. **Admin Controls**: Manual overrides, premium access grants, refunds

---

## 📁 Implementation Steps (Sequential)

### **Step 01: Database Schema** ⏱️ 2-3 hours
- Extend `training_centers` table with subscription fields
- Create `subscription_waiting_list` table
- Create `contact_limit_history` audit table
- Add helper functions for period calculations
- Update Drizzle ORM schema

**Deliverables:**
- Migration SQL files
- Updated schema.ts
- Database functions

---

### **Step 02: Backend Services** ⏱️ 4-5 hours
- `SubscriptionService`: Tier management, limits, overrides
- `ContactLimitService`: Usage tracking, validation
- `WaitingListService`: Waiting list management
- Helper utilities for tier logic

**Deliverables:**
- 3 service files
- Helper utilities
- Unit tests

---

### **Step 03: API Routes** ⏱️ 3-4 hours
- User endpoints: status, stats, waiting list
- Admin endpoints: grant premium, set limits, refunds
- Waiting list management endpoints
- Integration with existing jury request flow

**Deliverables:**
- 9 API route files
- Request validation schemas
- Error handling

---

### **Step 04: Frontend Components** ⏱️ 5-6 hours
- Subscription status card
- Contact limit badge
- Upgrade prompt modal
- Waiting list form
- Dashboard widget
- Tier comparison table

**Deliverables:**
- 6 reusable components
- Mobile-responsive UI
- French translations

---

### **Step 05: Admin Dashboard** ⏱️ 3-4 hours
- Waiting list management page
- Subscription management tools
- Statistics widgets
- Admin navigation updates

**Deliverables:**
- Admin pages
- Management interfaces
- Analytics widgets

---

### **Step 06: Integration & Testing** ⏱️ 4-5 hours
- Integrate into existing pages
- End-to-end testing
- Edge case validation
- Security testing

**Deliverables:**
- Integrated features
- Test suite
- Bug fixes

---

### **Step 07: Documentation & Deployment** ⏱️ 2-3 hours
- User documentation
- Admin documentation
- Developer documentation
- Production deployment
- Monitoring setup

**Deliverables:**
- Documentation
- Deployment checklist
- Monitoring dashboards

---

## ⏱️ Total Estimated Time
**23-30 hours** of development work

---

## 🎯 Success Metrics

### MVP Launch Criteria:
- ✅ Free tier limited to 1 contact/30 days
- ✅ Contact counter only increments on acceptance
- ✅ 30-day rolling period works correctly
- ✅ Waiting list captures interested users
- ✅ Admin can manage limits and access
- ✅ No bypass vulnerabilities
- ✅ Complete audit trail

### Post-Launch Metrics:
- Waiting list signup rate
- Free → Waiting list conversion
- Tier preference (Basic vs Pro)
- Contact usage patterns
- Admin override frequency

---

## 🔄 Future: Stripe Integration

When ready to activate paid subscriptions:

### Phase 1: Stripe Setup
- Create Stripe products/prices
- Implement customer creation
- Add subscription webhooks

### Phase 2: Payment Flow
- Checkout integration
- Payment processing
- Invoice generation

### Phase 3: Migration
- Convert waiting list to customers
- Launch paid tiers
- Monitor conversions

---

## 📊 Database Schema Overview

```
training_centers (extended)
├── subscription_tier
├── subscription_start_date
├── contacts_used_current_period
├── contacts_limit
├── first_accepted_contact_date
├── manual_contact_limit_override
└── premium_access_granted_until

subscription_waiting_list (new)
├── email
├── desired_tier
├── status
├── triggered_by
└── contacted_at

contact_limit_history (new)
├── training_center_id
├── event_type
├── contacts_used_before/after
├── performed_by
└── reason
```

---

## 🛠️ Tech Stack

- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Backend**: Next.js API Routes
- **Frontend**: React + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod
- **Future**: Stripe SDK

---

## 📖 Implementation Order

1. **Start Here**: Epic07-step01-database-schema.md
2. **Then**: Epic07-step02-backend-services.md
3. **Then**: Epic07-step03-api-routes.md
4. **Then**: Epic07-step04-frontend-components.md
5. **Then**: Epic07-step05-admin-dashboard.md
6. **Then**: Epic07-step06-integration-testing.md
7. **Finally**: Epic07-step07-deployment.md

---

## ⚠️ Important Notes

### MVP Scope (In Scope):
✅ Contact limits enforcement
✅ Waiting list collection
✅ Admin management tools
✅ Tier configuration
✅ Usage tracking

### Post-MVP (Out of Scope):
❌ Stripe payment processing
❌ Actual subscription billing
❌ Invoice generation
❌ Payment webhooks
❌ Subscription management portal

---

## 🎉 Ready to Start?

Begin with **Epic07-step01-database-schema.md** and follow the sequential steps!
