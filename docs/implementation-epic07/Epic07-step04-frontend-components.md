# Epic 07 - Step 04: Frontend Components & UI

## 🎯 Objective
Create user-facing components to display subscription status, contact limits, upgrade prompts, and waiting list forms.

---

## 📁 Component Structure

```
components/
├── subscription/
│   ├── subscription-status-card.tsx      # Display current tier & limits
│   ├── contact-limit-badge.tsx           # Small badge showing remaining contacts
│   ├── upgrade-prompt-modal.tsx          # Modal when limit reached
│   ├── waiting-list-form.tsx             # Form to join waiting list
│   ├── tier-comparison-table.tsx         # Pricing comparison
│   └── contact-usage-chart.tsx           # Visual usage indicator
├── dashboard/
│   └── subscription-widget.tsx           # Dashboard widget for centers
```

---

## 1️⃣ Subscription Status Card

**File: `components/subscription/subscription-status-card.tsx`**

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { formatTierName, getTierBadgeColor, getDaysRemainingInPeriod, formatPeriodEndDate } from '@/lib/utils/subscription-helpers';
import Link from 'next/link';

interface SubscriptionStatusCardProps {
  subscription: {
    tier: string;
    tierConfig: {
      tier: string;
      contactLimit: number;
      features: string[];
      price: number;
    };
    contacts: {
      used: number;
      limit: number;
      remaining: number;
    };
    period: {
      startDate: Date | null;
      needsReset: boolean;
    };
    features: {
      isPremiumAccess: boolean;
      hasManualOverride: boolean;
      premiumExpiresAt: Date | null;
    };
  };
  onUpgradeClick?: () => void;
}

export function SubscriptionStatusCard({ subscription, onUpgradeClick }: SubscriptionStatusCardProps) {
  const { tier, tierConfig, contacts, period, features } = subscription;
  const usagePercentage = (contacts.used / contacts.limit) * 100;
  const daysRemaining = getDaysRemainingInPeriod(period.startDate);
  const isLimitReached = contacts.remaining === 0;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Votre abonnement</h3>
            {features.isPremiumAccess && (
              <Badge className="bg-orange-100 text-orange-800">
                <Crown className="w-3 h-3 mr-1" />
                Accès Premium
              </Badge>
            )}
          </div>
          <Badge className={getTierBadgeColor(tier)}>
            {formatTierName(tier)}
          </Badge>
        </div>
        
        {tier !== 'pro' && !features.isPremiumAccess && (
          <Button
            onClick={onUpgradeClick}
            className="bg-[#ff6b35] hover:bg-[#ff5722] text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Passer au Pro
          </Button>
        )}
      </div>

      {/* Premium Access Notice */}
      {features.isPremiumAccess && features.premiumExpiresAt && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Crown className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900">Accès Premium Temporaire</p>
              <p className="text-orange-700">
                Expire le {new Date(features.premiumExpiresAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Contacts utilisés
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {contacts.used} / {contacts.limit}
          </span>
        </div>
        
        <Progress 
          value={usagePercentage} 
          className="h-2"
          indicatorClassName={
            usagePercentage >= 100 ? 'bg-red-500' :
            usagePercentage >= 80 ? 'bg-orange-500' :
            'bg-[#13d090]'
          }
        />
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {contacts.remaining} contact{contacts.remaining !== 1 ? 's' : ''} restant{contacts.remaining !== 1 ? 's' : ''}
          </span>
          {period.startDate && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Renouvellement dans {daysRemaining} jour{daysRemaining !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Limit Reached Warning */}
      {isLimitReached && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-900">Limite atteinte</p>
              <p className="text-red-700">
                Vous avez utilisé tous vos contacts pour cette période.
                {tier === 'gratuit' && ' Passez au plan Basic pour contacter jusqu\'à 5 jurys par mois.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Fonctionnalités incluses :</p>
        <ul className="space-y-2">
          {tierConfig.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-[#13d090] mt-0.5">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Period Info */}
      {period.startDate && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            Période en cours : {formatPeriodEndDate(period.startDate)}
          </p>
        </div>
      )}
    </Card>
  );
}
```

---

## 2️⃣ Contact Limit Badge

**File: `components/subscription/contact-limit-badge.tsx`**

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface ContactLimitBadgeProps {
  contactsRemaining: number;
  contactsLimit: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function ContactLimitBadge({ 
  contactsRemaining, 
  contactsLimit,
  size = 'md',
  showIcon = true 
}: ContactLimitBadgeProps) {
  const percentage = (contactsRemaining / contactsLimit) * 100;
  
  const getColorClass = () => {
    if (percentage === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (percentage <= 20) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-base px-4 py-2';
      default: return 'text-sm px-3 py-1.5';
    }
  };

  return (
    <Badge className={`${getColorClass()} ${getSizeClass()} border font-medium`}>
      {showIcon && <Users className="w-3 h-3 mr-1" />}
      {contactsRemaining} / {contactsLimit} contacts
    </Badge>
  );
}
```

---

## 3️⃣ Upgrade Prompt Modal

**File: `components/subscription/upgrade-prompt-modal.tsx`**

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, TrendingUp } from 'lucide-react';
import { WaitingListForm } from './waiting-list-form';
import { SUBSCRIPTION_TIERS } from '@/lib/services/subscription-service';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  contactsUsed: number;
  triggeredBy?: 'limit_reached' | 'manual';
}

export function UpgradePromptModal({ 
  isOpen, 
  onClose, 
  currentTier,
  contactsUsed,
  triggeredBy = 'limit_reached'
}: UpgradePromptModalProps) {
  const [showWaitingList, setShowWaitingList] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'pro'>('basic');

  const recommendedTier = currentTier === 'gratuit' ? 'basic' : 'pro';
  const currentTierConfig = SUBSCRIPTION_TIERS[currentTier];
  const basicTierConfig = SUBSCRIPTION_TIERS.basic;
  const proTierConfig = SUBSCRIPTION_TIERS.pro;

  if (showWaitingList) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejoindre la liste d'attente</DialogTitle>
            <DialogDescription>
              Les abonnements payants seront bientôt disponibles. Rejoignez la liste d'attente pour être informé du lancement.
            </DialogDescription>
          </DialogHeader>
          
          <WaitingListForm
            desiredTier={selectedTier}
            triggeredBy={triggeredBy}
            currentContactsUsed={contactsUsed}
            onSuccess={() => {
              setShowWaitingList(false);
              onClose();
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {triggeredBy === 'limit_reached' 
              ? 'Limite de contacts atteinte' 
              : 'Passez au niveau supérieur'}
          </DialogTitle>
          <DialogDescription>
            {triggeredBy === 'limit_reached' 
              ? 'Vous avez utilisé tous vos contacts gratuits. Découvrez nos plans pour contacter plus de jurys.' 
              : 'Débloquez plus de fonctionnalités et contactez plus de jurys chaque mois.'}
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Basic Plan */}
          <div className={`border-2 rounded-lg p-6 ${recommendedTier === 'basic' ? 'border-[#ff6b35]' : 'border-gray-200'}`}>
            {recommendedTier === 'basic' && (
              <div className="bg-[#ff6b35] text-white text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                Recommandé
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-2">Basic</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">39€</span>
              <span className="text-gray-600">/mois</span>
            </div>

            <ul className="space-y-3 mb-6">
              {basicTierConfig.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => {
                setSelectedTier('basic');
                setShowWaitingList(true);
              }}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              Rejoindre la liste d'attente
            </Button>
          </div>

          {/* Pro Plan */}
          <div className={`border-2 rounded-lg p-6 ${recommendedTier === 'pro' ? 'border-[#ff6b35]' : 'border-gray-200'}`}>
            {recommendedTier === 'pro' && (
              <div className="bg-[#ff6b35] text-white text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">
                Recommandé
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">89€</span>
              <span className="text-gray-600">/mois</span>
            </div>

            <ul className="space-y-3 mb-6">
              {proTierConfig.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => {
                setSelectedTier('pro');
                setShowWaitingList(true);
              }}
              className="w-full bg-[#ff6b35] hover:bg-[#ff5722] text-white"
            >
              Rejoindre la liste d'attente
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note :</strong> Les abonnements payants seront disponibles prochainement. 
            En rejoignant la liste d'attente, vous serez parmi les premiers informés du lancement 
            et bénéficierez d'une offre spéciale de lancement.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 4️⃣ Waiting List Form

**File: `components/subscription/waiting-list-form.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

interface WaitingListFormProps {
  desiredTier: 'basic' | 'pro';
  triggeredBy?: 'limit_reached' | 'pricing_page' | 'dashboard_cta' | 'manual';
  currentContactsUsed?: number;
  onSuccess?: () => void;
}

export function WaitingListForm({ 
  desiredTier, 
  triggeredBy = 'manual',
  currentContactsUsed,
  onSuccess 
}: WaitingListFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/subscription/waiting-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          desiredTier,
          triggeredBy,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        showToast({
          title: 'Inscription réussie !',
          description: data.message,
          variant: 'default',
        });
        
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        showToast({
          title: 'Erreur',
          description: data.error || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    } catch (error) {
      showToast({
        title: 'Erreur',
        description: 'Impossible de rejoindre la liste d\'attente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Merci de votre intérêt !
        </h3>
        <p className="text-gray-600">
          Nous vous contacterons dès que le plan {desiredTier === 'basic' ? 'Basic' : 'Pro'} sera disponible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
          disabled={loading}
        />
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          Plan sélectionné : <strong>{desiredTier === 'basic' ? 'Basic (39€/mois)' : 'Pro (89€/mois)'}</strong>
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#ff6b35] hover:bg-[#ff5722] text-white"
        disabled={loading}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Rejoindre la liste d'attente
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Vous recevrez un email dès que les abonnements seront disponibles.
      </p>
    </form>
  );
}
```

---

## 5️⃣ Dashboard Widget

**File: `components/dashboard/subscription-widget.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ContactLimitBadge } from '@/components/subscription/contact-limit-badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export function SubscriptionWidget() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const usagePercentage = (subscription.contacts.used / subscription.contacts.limit) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Contacts disponibles</h3>
        <ContactLimitBadge
          contactsRemaining={subscription.contacts.remaining}
          contactsLimit={subscription.contacts.limit}
          size="sm"
        />
      </div>

      <Progress 
        value={usagePercentage} 
        className="h-2 mb-4"
        indicatorClassName={
          usagePercentage >= 100 ? 'bg-red-500' :
          usagePercentage >= 80 ? 'bg-orange-500' :
          'bg-[#13d090]'
        }
      />

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>{subscription.contacts.used} utilisés</span>
        <span>{subscription.contacts.remaining} restants</span>
      </div>

      {subscription.tier !== 'pro' && (
        <Link href="/pricing">
          <Button className="w-full bg-[#ff6b35] hover:bg-[#ff5722] text-white" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Passer au Pro
          </Button>
        </Link>
      )}
    </Card>
  );
}
```

---

## ✅ Implementation Checklist

- [ ] Create all component files
- [ ] Add necessary UI components (Badge, Progress, Dialog, etc.)
- [ ] Test components with different subscription states
- [ ] Ensure mobile responsiveness
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Verify French translations

---

## 🚀 Next Steps

After completing this step:
1. Create all component files
2. Test components in isolation (Storybook optional)
3. Integrate components into existing pages
4. Test user flows end-to-end
5. Proceed to **Step 05: Admin Dashboard Integration**
