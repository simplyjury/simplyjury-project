'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { TierComparisonTable } from '@/components/subscription';
import { WaitingListForm } from '@/components/subscription';
import { useToast } from '@/components/ui/toast';
import type { SubscriptionTier } from '@/lib/types/subscription';

// Force dynamic rendering to avoid SSR issues with useToast
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const [showWaitingListForm, setShowWaitingListForm] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro'>('basic');
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('gratuit');
  const { showToast } = useToast();
  
  // Fetch current subscription status if user is logged in
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setCurrentTier(data.data.tier);
        }
      } catch (error) {
        // User not logged in or error - use default 'gratuit'
      }
    };
    
    fetchSubscriptionStatus();
  }, []);
  
  const handleJoinWaitingList = (tier: 'basic' | 'pro') => {
    setSelectedTier(tier);
    setShowWaitingListForm(true);
  };
  
  const handleWaitingListSuccess = () => {
    setShowWaitingListForm(false);
    showToast({
      type: 'success',
      title: 'Inscription réussie !',
      message: 'Nous vous contacterons bientôt pour activer votre abonnement.',
      duration: 5000
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] to-[#e8faf5]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="https://vbnnjwgfbadvqavqnlhh.supabase.co/storage/v1/object/public/simplyjury-assets/logos/simplyjury-logo.png" 
                alt="SimplyJury Logo" 
                width={150}
                height={48}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/sign-in" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Se connecter
              </Link>
              <Link 
                href="/sign-in" 
                className="bg-[#2563eb] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Créer un compte
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tarifs SimplyJury
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Choisissez le plan qui convient le mieux à vos besoins d'organisme de formation
          </p>
          <p className="text-sm text-gray-500">
            Commission de 20% prélevée sur chaque mission de jury
          </p>
        </div>

        {/* Billing Toggle - Prepared for future annual billing */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
              Mensuel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 rounded-md">
              Annuel (bientôt disponible)
            </button>
          </div>
        </div>

        {/* Epic 07: Tier Comparison Table */}
        <TierComparisonTable
          currentTier={currentTier}
          onJoinWaitingList={handleJoinWaitingList}
          className="max-w-6xl mx-auto"
        />
        
        {/* Epic 07: Waiting List Form Modal */}
        {showWaitingListForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowWaitingListForm(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <WaitingListForm
                triggeredBy="pricing_page"
                onSuccess={handleWaitingListSuccess}
              />
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Qui utilise SimplyJury ?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Organismes de Formation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Certificateurs :</strong> Pilotent leurs certifications (clients principaux)</li>
                  <li>• <strong>Partenaires habilités :</strong> Organisent des jurys pour les certificateurs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Jurys Professionnels</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Inscription gratuite</strong></li>
                  <li>• <strong>Rémunération</strong> via les missions</li>
                  <li>• Commission SimplyJury : 20% par mission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SimplyJury. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

