# Epic 07 - Step 06: Integration & Testing

## 🎯 Objective
Integrate all components and thoroughly test the subscription system.

---

## 🔗 Integration Points

### 1. Jury Search Page (`/dashboard/search`)
- Add contact limit check before allowing requests
- Show remaining contacts badge
- Display upgrade prompt when limit reached

### 2. Center Dashboard (`/dashboard`)
- Add subscription widget
- Show contact usage statistics
- Display upgrade CTA if on free tier

### 3. Pricing Page (`/pricing`)
- Add waiting list form at bottom
- Update CTAs to join waiting list (not payment)
- Add "Paiements disponibles prochainement" notice

### 4. Jury Request Flow
- Check limits before request creation
- Increment counter on jury acceptance
- Send notification when limit reached

---

## 🧪 Testing Scenarios

### User Flow Tests:
1. **Free Tier User - First Contact**
   - Send request → Jury accepts → Counter = 1
   - Try second request → Blocked → Upgrade prompt shown

2. **30-Day Period Reset**
   - User with 1 contact used
   - Wait 30 days (or manually trigger)
   - Counter resets to 0
   - Can send new request

3. **Waiting List**
   - User joins waiting list
   - Duplicate email → Shows message
   - Admin marks as contacted
   - Status updates correctly

4. **Admin Override**
   - Admin grants premium access
   - User can contact 15 juries
   - Premium expires → Reverts to tier limit

### Edge Cases:
- Request pending when limit reached
- Jury accepts after period expires
- Multiple requests to same jury
- Admin refunds contact
- Tier upgrade mid-period

---

## ✅ Testing Checklist

### Functional Tests:
- [ ] Contact counter increments only on acceptance
- [ ] Limits enforced correctly per tier
- [ ] 30-day period resets automatically
- [ ] Waiting list prevents duplicates
- [ ] Admin overrides work correctly
- [ ] Premium access expires properly

### UI/UX Tests:
- [ ] Upgrade prompts display correctly
- [ ] Progress bars show accurate usage
- [ ] Mobile responsive on all screens
- [ ] Loading states work
- [ ] Error messages are clear
- [ ] Success confirmations appear

### Security Tests:
- [ ] Non-admin cannot access admin routes
- [ ] Users cannot bypass contact limits
- [ ] SQL injection prevention
- [ ] XSS prevention in forms

---

## 🚀 Next Steps
Proceed to **Step 07: Documentation & Deployment**
