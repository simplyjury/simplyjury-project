# 📊 Subscription Tiers - Quick Reference

## 🎯 Tier Overview

| Tier | Price | Contacts/Month | Status |
|------|-------|----------------|--------|
| **Gratuit** | 0€ | 1 | ✅ Active (MVP) |
| **Basic** | 39€ | 5 | 🟡 Waiting List Only |
| **Pro** | 89€ | 15 | 🟡 Waiting List Only |

---

## 📋 Feature Comparison

### Gratuit (Free Tier)
**Price:** 0€/mois  
**Contacts:** 1 jury par période de 30 jours

**Fonctionnalités:**
- ✅ 1 jury pour tester
- ✅ Messagerie pour 1 mission
- ✅ Support par email
- ✅ Visibilité standard
- ❌ Pas de tableau de bord avancé
- ❌ Pas de gestion des certifications
- ❌ Pas d'exports

**Cas d'usage:**
- Découverte de la plateforme
- Centres avec besoins ponctuels
- Test avant engagement

---

### Basic
**Price:** 39€/mois  
**Contacts:** 5 jurys par période de 30 jours

**Fonctionnalités:**
- ✅ Jusqu'à 5 jurys par mois
- ✅ Messagerie complète
- ✅ Support par email
- ✅ Tableau de bord simplifié
- ✅ Visibilité standard
- ❌ Pas de gestion des certifications
- ❌ Pas d'exports avancés
- ❌ Pas de badge "OF Pro vérifié"

**Cas d'usage:**
- Centres de formation en croissance
- Besoins réguliers mais modérés
- Budget limité

---

### Pro
**Price:** 89€/mois  
**Contacts:** 15 jurys par période de 30 jours

**Fonctionnalités:**
- ✅ Jusqu'à 15 jurys par mois
- ✅ Tableau de bord complet
- ✅ Gestion des certifications
- ✅ Suivi et traçabilité des missions
- ✅ Support prioritaire
- ✅ Exports (Excel, PDF)
- ✅ Badge "OF Pro vérifié"
- ✅ Visibilité prioritaire

**Cas d'usage:**
- Centres de formation établis
- Besoins importants et réguliers
- Organismes certificateurs
- Besoin de reporting avancé

---

## 🔄 Contact Counting Rules

### ✅ When Contacts Are Counted
A contact is **ONLY** counted when:
1. Training center sends a request to a jury
2. **Jury ACCEPTS the request**
3. Status changes to `accepted`

### ❌ When Contacts Are NOT Counted
Contacts are **NOT** counted when:
- Request is sent but pending (no response yet)
- Jury declines the request
- Request is cancelled by center
- Request expires without response

### 📅 30-Day Rolling Window
- Period starts on **first accepted contact**
- Resets **30 days** after first accepted contact
- Not based on calendar month
- Automatic reset when period expires

**Example:**
- Jan 15: First jury accepts → Period starts
- Jan 20: Second jury accepts → 2 contacts used
- Feb 14: Period resets → Back to 0 contacts used
- Feb 15: New jury accepts → New period starts

---

## 🎫 Admin Override Capabilities

### Manual Contact Limit Override
Admins can set custom limits for specific centers:
- **Use case:** Customer service, special agreements, testing
- **Can expire:** Optional expiration date
- **Requires reason:** Must document why
- **Audit trail:** Logged in `contact_limit_history`

**Example:**
```typescript
// Grant 10 contacts for 7 days
setManualLimitOverride(
  centerId: 123,
  newLimit: 10,
  reason: "Partenariat test - 7 jours",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  performedBy: adminUserId
)
```

### Temporary Premium Access
Admins can grant Pro-level access temporarily:
- **Use case:** Trials, partnerships, compensation
- **Duration:** Must have expiration date
- **Limit:** 15 contacts (Pro tier)
- **Requires reason:** Must document why
- **Audit trail:** Logged in `contact_limit_history`

**Example:**
```typescript
// Grant Pro access for 30 days
grantPremiumAccess(
  centerId: 123,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  reason: "Essai gratuit - nouveau partenaire",
  grantedBy: adminUserId
)
```

### Contact Refund
Admins can refund contacts for errors or disputes:
- **Use case:** System errors, disputes, customer service
- **Effect:** Decrements `contacts_used_current_period` by 1
- **Requires reason:** Must document why
- **Audit trail:** Logged in `contact_limit_history`

**Example:**
```typescript
// Refund a contact
refundContact(
  centerId: 123,
  juryRequestId: 456,
  reason: "Erreur système - jury n'a pas répondu",
  performedBy: adminUserId
)
```

---

## 📊 Database Field Reference

### training_centers Table

| Field | Type | Description |
|-------|------|-------------|
| `subscription_tier` | VARCHAR(20) | Current tier: 'gratuit', 'basic', 'pro' |
| `subscription_start_date` | TIMESTAMP | When current tier started |
| `contacts_used_current_period` | INTEGER | Contacts used in current 30-day window |
| `contacts_limit` | INTEGER | Base limit from tier (1, 5, or 15) |
| `first_accepted_contact_date` | TIMESTAMP | Start of current 30-day window |
| `last_contact_reset_date` | TIMESTAMP | Last time counter was reset |
| `manual_contact_limit_override` | INTEGER | Admin override (if set) |
| `manual_limit_override_reason` | TEXT | Why override was set |
| `manual_limit_override_expires` | TIMESTAMP | When override expires |
| `premium_access_granted_until` | TIMESTAMP | Premium access expiration |
| `premium_access_granted_by` | INTEGER | Admin who granted access |
| `premium_access_reason` | TEXT | Why premium was granted |

---

## 🔍 Effective Limit Calculation

The **effective limit** is calculated in this priority order:

1. **Premium Access** (if active and not expired)
   - Returns: 15 contacts (Pro tier limit)

2. **Manual Override** (if set and not expired)
   - Returns: Override value

3. **Tier-Based Limit** (default)
   - Returns: `contacts_limit` from tier

**Example:**
```typescript
// Center with gratuit tier (1 contact)
// Admin grants manual override of 3 contacts
// Effective limit = 3 (override takes precedence)

// Later, admin grants premium access
// Effective limit = 15 (premium takes precedence over override)

// Premium expires
// Effective limit = 3 (back to override)

// Override expires
// Effective limit = 1 (back to tier limit)
```

---

## 🎯 Waiting List (MVP Phase)

### Data Collected
- ✅ Email address
- ✅ Desired tier (Basic or Pro)
- ✅ Trigger context (how they joined)
- ✅ Current contacts used (if authenticated)

### NOT Collected (MVP)
- ❌ Payment information
- ❌ Company details (already in profile)
- ❌ Phone number
- ❌ Specific needs/requirements

### Statuses
- **pending**: Just joined, not contacted yet
- **contacted**: Admin reached out
- **converted**: User subscribed (post-MVP)
- **declined**: User no longer interested

### Triggers
- **limit_reached**: Hit contact limit
- **pricing_page**: From pricing page CTA
- **dashboard_cta**: From dashboard upgrade button
- **manual**: Admin added them

---

## 💡 Business Logic Examples

### Example 1: Free Tier User Journey
```
Day 1: User signs up → Tier: gratuit, Limit: 1
Day 5: Sends request to Jury A → Status: pending
Day 6: Jury A accepts → contacts_used = 1, first_accepted_contact_date = Day 6
Day 7: Tries to send request to Jury B → BLOCKED (limit reached)
Day 7: Sees upgrade prompt → Joins waiting list for Basic
Day 36: Period resets (30 days after Day 6) → contacts_used = 0
Day 37: Can send new request
```

### Example 2: Admin Override
```
Day 1: Center at limit (1/1 contacts used)
Day 2: Admin grants manual override of 5 contacts for 14 days
Day 2: Center can now contact 4 more juries (5 - 1 = 4 remaining)
Day 10: Center uses all 5 contacts
Day 16: Override expires → Back to tier limit of 1
Day 16: Period hasn't reset yet → Still at limit
Day 31: Period resets → contacts_used = 0, can use 1 contact again
```

### Example 3: Premium Access
```
Day 1: Center on gratuit tier (1 contact limit)
Day 5: Admin grants 30-day premium access (partnership)
Day 5: Center now has 15 contacts available (Pro tier)
Day 20: Center uses 10 contacts
Day 35: Premium expires → Back to gratuit tier (1 contact)
Day 35: contacts_used = 10, limit = 1 → Over limit!
Day 35: Must wait for period reset to send new requests
```

---

## 🔐 Security & Validation

### API Validation Rules
- ✅ Only authenticated users can check subscription status
- ✅ Only training centers can join waiting list
- ✅ Only admins can grant overrides/premium access
- ✅ Only admins can refund contacts
- ✅ Contact limits enforced at API level (not just UI)

### Rate Limiting (Future)
Consider implementing rate limiting for:
- Waiting list submissions (prevent spam)
- Subscription status checks (prevent abuse)
- Admin actions (prevent mistakes)

---

## 📈 Analytics & Metrics

### Key Metrics to Track
- **Conversion Rate**: Waiting list → Paid subscriber
- **Churn Rate**: Paid → Cancelled
- **Usage Rate**: Contacts used / Contacts available
- **Limit Hit Rate**: % of users hitting limit
- **Upgrade Triggers**: Which trigger drives most conversions

### Database Queries
```sql
-- Centers at limit
SELECT COUNT(*) 
FROM training_centers 
WHERE contacts_used_current_period >= contacts_limit;

-- Waiting list by tier
SELECT desired_tier, COUNT(*) 
FROM subscription_waiting_list 
WHERE status = 'pending'
GROUP BY desired_tier;

-- Average usage by tier
SELECT subscription_tier, AVG(contacts_used_current_period)
FROM training_centers
GROUP BY subscription_tier;
```

---

## 🚀 Future Enhancements (Post-MVP)

### Phase 2: Stripe Integration
- [ ] Automatic subscription creation
- [ ] Payment processing
- [ ] Webhook handling
- [ ] Invoice generation
- [ ] Proration on upgrades/downgrades

### Phase 3: Advanced Features
- [ ] Annual billing (discount)
- [ ] Custom enterprise plans
- [ ] Add-on purchases (extra contacts)
- [ ] Referral program
- [ ] Volume discounts

---

**Last Updated**: 2025-01-06  
**Version**: MVP (Phase 1)  
**Next Review**: After Stripe integration
