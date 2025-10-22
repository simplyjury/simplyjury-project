'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings, Shield, BarChart3, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  hasUserMadeCookieChoice,
  acceptAllCookies,
  rejectOptionalCookies,
  saveCookiePreferences,
  getCookiePreferences,
  type CookiePreferences,
} from '@/lib/utils/cookie-consent';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasChoice = hasUserMadeCookieChoice();
    if (!hasChoice) {
      // Small delay to avoid flash on page load
      setTimeout(() => setIsVisible(true), 500);
    } else {
      // Load existing preferences
      const existing = getCookiePreferences();
      if (existing) {
        setPreferences(existing);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setIsVisible(false);
  };

  const togglePreference = (key: 'analytics' | 'marketing') => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0d4a70] to-[#0c608a] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Cookie className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Gestion des cookies
                </h3>
              </div>
              <button
                onClick={handleRejectOptional}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showDetails ? (
                // Simple View
                <div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience sur SimplyJury. 
                    Les cookies nécessaires sont essentiels au fonctionnement du site. 
                    Vous pouvez choisir d'accepter ou de refuser les cookies optionnels (analytiques et marketing).
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-[#13d090] hover:bg-[#10b87a] text-white font-semibold rounded-full py-3"
                    >
                      Tout accepter
                    </Button>
                    <Button
                      onClick={handleRejectOptional}
                      variant="outline"
                      className="flex-1 border-2 border-[#0d4a70] text-[#0d4a70] hover:bg-[#0d4a70] hover:text-white font-semibold rounded-full py-3"
                    >
                      Tout refuser
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-full py-3"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Personnaliser
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    En savoir plus sur notre{' '}
                    <Link href="/privacy" className="text-[#0d4a70] hover:underline font-medium">
                      politique de confidentialité
                    </Link>
                  </p>
                </div>
              ) : (
                // Detailed View
                <div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Personnalisez vos préférences en matière de cookies. 
                    Les cookies nécessaires ne peuvent pas être désactivés car ils sont essentiels au fonctionnement du site.
                  </p>

                  {/* Cookie Categories */}
                  <div className="space-y-4 mb-6">
                    {/* Necessary Cookies */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-[#0d4a70] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#0d4a70] mb-1">
                              Cookies nécessaires
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Ces cookies sont essentiels pour le fonctionnement du site. 
                              Ils permettent l'authentification, la sécurité et les fonctionnalités de base.
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="px-3 py-1 bg-[#13d090] text-white text-xs font-semibold rounded-full">
                            Toujours actif
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-[#bea1e5] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-[#bea1e5] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <BarChart3 className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#0d4a70] mb-1">
                              Cookies analytiques
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Ces cookies nous aident à comprendre comment vous utilisez le site 
                              pour améliorer votre expérience (Google Analytics, statistiques d'utilisation).
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => togglePreference('analytics')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences.analytics ? 'bg-[#13d090]' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={preferences.analytics}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-[#fdce0f] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-10 h-10 bg-[#fdce0f] rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#0d4a70] mb-1">
                              Cookies marketing
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Ces cookies sont utilisés pour afficher des publicités pertinentes 
                              et mesurer l'efficacité de nos campagnes marketing.
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => togglePreference('marketing')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences.marketing ? 'bg-[#13d090]' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={preferences.marketing}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1 bg-[#0d4a70] hover:bg-[#0c608a] text-white font-semibold rounded-full py-3"
                    >
                      Enregistrer mes choix
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-[#13d090] hover:bg-[#10b87a] text-white font-semibold rounded-full py-3"
                    >
                      Tout accepter
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    <Link href="/privacy" className="text-[#0d4a70] hover:underline font-medium">
                      Politique de confidentialité
                    </Link>
                    {' • '}
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-[#0d4a70] hover:underline font-medium"
                    >
                      Retour
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
