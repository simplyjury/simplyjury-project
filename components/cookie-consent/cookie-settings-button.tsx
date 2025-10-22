'use client';

import { useState } from 'react';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetCookiePreferences } from '@/lib/utils/cookie-consent';

/**
 * Button to reopen cookie settings
 * Can be placed in footer or settings page
 */
export function CookieSettingsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenSettings = () => {
    setIsLoading(true);
    // Reset preferences to show banner again
    resetCookiePreferences();
    // Reload page to show banner
    window.location.reload();
  };

  return (
    <Button
      onClick={handleOpenSettings}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      <Cookie className="h-4 w-4 mr-2" />
      {isLoading ? 'Chargement...' : 'Paramètres des cookies'}
    </Button>
  );
}
