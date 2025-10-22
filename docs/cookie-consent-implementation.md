# Cookie Consent Implementation - SimplyJury

## Overview

This document describes the GDPR-compliant cookie consent implementation for SimplyJury, designed specifically for French regulations.

## Features

### ✅ GDPR Compliance
- **Explicit consent required** before setting non-essential cookies
- **Granular control** over different cookie categories
- **Easy opt-out** mechanism
- **Persistent storage** of user preferences
- **Transparent information** about cookie usage

### 🎨 Design
- Follows SimplyJury brand guidelines
- Uses brand colors (Marine Blue #0d4a70, Mint Green #13d090, Yellow #fdce0f, Violet #bea1e5)
- Mobile-first responsive design
- Smooth animations and transitions
- Accessible UI with proper ARIA labels

### 🍪 Cookie Categories

1. **Cookies Nécessaires (Necessary)**
   - Always active, cannot be disabled
   - Essential for authentication, security, and basic functionality
   - Examples: Session cookies, CSRF tokens

2. **Cookies Analytiques (Analytics)**
   - Optional, user can enable/disable
   - Used for understanding site usage and improving UX
   - Examples: Google Analytics, usage statistics

3. **Cookies Marketing (Marketing)**
   - Optional, user can enable/disable
   - Used for targeted advertising and campaign tracking
   - Examples: Facebook Pixel, Google Ads

## File Structure

```
/lib/utils/
  └── cookie-consent.ts          # Core utility functions for cookie management

/components/cookie-consent/
  ├── cookie-banner.tsx           # Main cookie consent banner component
  ├── cookie-settings-button.tsx  # Button to reopen settings
  └── index.ts                    # Export file
```

## Implementation

### 1. Cookie Management Utilities (`lib/utils/cookie-consent.ts`)

**Key Functions:**
- `getCookiePreferences()`: Retrieve stored preferences
- `saveCookiePreferences()`: Save user choices
- `hasUserMadeCookieChoice()`: Check if user has made a choice
- `acceptAllCookies()`: Accept all cookie categories
- `rejectOptionalCookies()`: Only accept necessary cookies
- `resetCookiePreferences()`: Clear stored preferences

**Storage:**
- Uses `localStorage` with key: `simplyjury_cookie_consent`
- Includes version number for future updates
- Stores timestamp of user choice

### 2. Cookie Banner Component (`components/cookie-consent/cookie-banner.tsx`)

**Features:**
- Two views: Simple and Detailed
- Simple view: Accept all / Reject all / Customize
- Detailed view: Granular control per category with toggle switches
- Backdrop overlay to focus attention
- Auto-shows after 500ms delay on first visit
- Remembers user choice across sessions

**User Flow:**
1. First-time visitor sees banner after 500ms
2. Can choose: Accept All, Reject Optional, or Customize
3. In Customize view, can toggle Analytics and Marketing cookies
4. Preferences saved to localStorage
5. Banner doesn't show again unless preferences are reset

### 3. Cookie Settings Button (`components/cookie-consent/cookie-settings-button.tsx`)

- Allows users to change preferences anytime
- Placed in footer for easy access
- Resets preferences and reloads page to show banner

## Integration

### Homepage Integration

The cookie banner is integrated into the homepage (`app/page.tsx`):

```tsx
import { CookieBanner } from '@/components/cookie-consent';
import { CookieSettingsButton } from '@/components/cookie-consent/cookie-settings-button';

// In component:
<CookieBanner />

// In footer:
<CookieSettingsButton />
```

## French Regulations Compliance

### CNIL (Commission Nationale de l'Informatique et des Libertés) Requirements

✅ **Consent before tracking**: Non-essential cookies only set after explicit consent

✅ **Clear information**: Banner explains what cookies are used for

✅ **Easy to refuse**: "Tout refuser" button prominently displayed

✅ **Granular choices**: Users can choose specific cookie categories

✅ **Persistent choice**: User preferences stored and respected

✅ **Easy to change**: Cookie settings accessible via footer button

✅ **Privacy policy link**: Direct link to full privacy policy

### RGPD (Règlement Général sur la Protection des Données) Requirements

✅ **Lawful basis**: Consent obtained before processing

✅ **Transparency**: Clear explanation of each cookie category

✅ **User rights**: Easy to withdraw consent anytime

✅ **Data minimization**: Only necessary cookies active by default

✅ **Purpose limitation**: Each category has clear purpose

## Future Enhancements

### Recommended Additions:

1. **Analytics Integration**
   - Connect to Google Analytics with consent mode
   - Only initialize tracking after user consent

2. **Marketing Integration**
   - Connect to Facebook Pixel, Google Ads
   - Conditional loading based on consent

3. **Cookie Policy Page**
   - Detailed page explaining each cookie
   - List of specific cookies used
   - Duration and purpose of each

4. **Consent Management API**
   - Backend endpoint to track consent rates
   - Analytics on user choices
   - Compliance reporting

## Testing

### Manual Testing Checklist:

- [ ] Banner appears on first visit after 500ms
- [ ] "Tout accepter" saves all preferences
- [ ] "Tout refuser" saves only necessary cookies
- [ ] "Personnaliser" opens detailed view
- [ ] Toggle switches work for Analytics and Marketing
- [ ] "Enregistrer mes choix" saves custom preferences
- [ ] Banner doesn't reappear after choice is made
- [ ] Footer button reopens settings
- [ ] Preferences persist across page reloads
- [ ] Mobile responsive design works correctly
- [ ] Links to privacy policy work
- [ ] Accessible with keyboard navigation

### Browser Testing:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Maintenance

### Updating Cookie Categories:

1. Add new category to `CookieCategory` type in `cookie-consent.ts`
2. Update `CookiePreferences` interface
3. Add enable/disable functions for new category
4. Add UI section in `cookie-banner.tsx`
5. Update documentation

### Updating Consent Version:

When making breaking changes to consent structure:

```typescript
const COOKIE_CONSENT_VERSION = '2.0'; // Increment version
```

This will invalidate old preferences and show banner again.

## Support

For questions or issues with the cookie consent implementation, contact the development team.

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Compliance**: RGPD/GDPR, CNIL Guidelines
