/**
 * Cookie Consent Management Utilities
 * GDPR-compliant cookie consent management for SimplyJury
 */

export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookiePreferences {
  necessary: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const COOKIE_CONSENT_KEY = 'simplyjury_cookie_consent';
const COOKIE_CONSENT_VERSION = '1.0';

/**
 * Get current cookie preferences from localStorage
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Validate the stored data
    if (parsed.version === COOKIE_CONSENT_VERSION && parsed.preferences) {
      return parsed.preferences;
    }
    return null;
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
    return null;
  }
}

/**
 * Save cookie preferences to localStorage
 */
export function saveCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data = {
      version: COOKIE_CONSENT_VERSION,
      preferences: {
        ...preferences,
        necessary: true, // Always true
        timestamp: Date.now(),
      },
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));
    
    // Apply preferences immediately
    applyCookiePreferences(preferences);
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
  }
}

/**
 * Check if user has made a cookie choice
 */
export function hasUserMadeCookieChoice(): boolean {
  return getCookiePreferences() !== null;
}

/**
 * Apply cookie preferences (enable/disable tracking scripts)
 */
export function applyCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  
  // Analytics cookies (Google Analytics, etc.)
  if (preferences.analytics) {
    enableAnalytics();
  } else {
    disableAnalytics();
  }
  
  // Marketing cookies (Facebook Pixel, etc.)
  if (preferences.marketing) {
    enableMarketing();
  } else {
    disableMarketing();
  }
}

/**
 * Enable analytics tracking
 */
function enableAnalytics(): void {
  // Placeholder for Google Analytics or other analytics tools
  // Example: window.gtag('consent', 'update', { analytics_storage: 'granted' });
  console.log('Analytics enabled');
}

/**
 * Disable analytics tracking
 */
function disableAnalytics(): void {
  // Placeholder for disabling analytics
  // Example: window.gtag('consent', 'update', { analytics_storage: 'denied' });
  console.log('Analytics disabled');
}

/**
 * Enable marketing tracking
 */
function enableMarketing(): void {
  // Placeholder for marketing pixels
  // Example: window.gtag('consent', 'update', { ad_storage: 'granted' });
  console.log('Marketing enabled');
}

/**
 * Disable marketing tracking
 */
function disableMarketing(): void {
  // Placeholder for disabling marketing
  // Example: window.gtag('consent', 'update', { ad_storage: 'denied' });
  console.log('Marketing disabled');
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  const preferences: CookiePreferences = {
    necessary: true,
    analytics: true,
    marketing: true,
    timestamp: Date.now(),
  };
  saveCookiePreferences(preferences);
}

/**
 * Reject optional cookies (only necessary cookies)
 */
export function rejectOptionalCookies(): void {
  const preferences: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  };
  saveCookiePreferences(preferences);
}

/**
 * Reset cookie preferences (for testing or user request)
 */
export function resetCookiePreferences(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COOKIE_CONSENT_KEY);
}
