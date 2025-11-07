'use client';

// Epic 07 - Waiting List Form Component
// Form to join the subscription waiting list

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { isValidEmail } from '@/lib/utils/subscription-helpers';
import type { WaitingListTrigger } from '@/lib/types/subscription';

interface WaitingListFormProps {
  triggeredBy?: WaitingListTrigger;
  currentContactsUsed?: number;
  onSuccess?: () => void;
  className?: string;
}

export function WaitingListForm({
  triggeredBy = 'pricing_page',
  currentContactsUsed,
  onSuccess,
  className = '',
}: WaitingListFormProps) {
  const [email, setEmail] = useState('');
  const [desiredTier, setDesiredTier] = useState<'basic' | 'pro'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email || !isValidEmail(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscription/waiting-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          desiredTier,
          triggeredBy,
          currentContactsUsed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'ALREADY_ON_WAITING_LIST') {
          setError('Vous êtes déjà sur la liste d\'attente pour ce forfait');
        } else {
          setError(data.error || 'Une erreur est survenue');
        }
        return;
      }

      setSuccess(true);
      setEmail('');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inscription réussie !
            </h3>
            <p className="text-sm text-gray-600">
              Nous vous contacterons dès que les abonnements payants seront disponibles.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Rejoindre la liste d'attente
        </CardTitle>
        <CardDescription>
          Soyez informé en priorité du lancement des abonnements payants
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Tier Selection */}
          <div className="space-y-3">
            <Label>Forfait souhaité</Label>
            <RadioGroup
              value={desiredTier}
              onValueChange={(value) => setDesiredTier(value as 'basic' | 'pro')}
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4 hover:border-primary cursor-pointer">
                <RadioGroupItem value="basic" id="basic" />
                <Label htmlFor="basic" className="flex-1 cursor-pointer">
                  <div className="font-medium">Basic - 39€/mois</div>
                  <div className="text-sm text-gray-600">5 contacts par mois</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4 hover:border-primary cursor-pointer">
                <RadioGroupItem value="pro" id="pro" />
                <Label htmlFor="pro" className="flex-1 cursor-pointer">
                  <div className="font-medium">Pro - 89€/mois</div>
                  <div className="text-sm text-gray-600">15 contacts par mois</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              'Rejoindre la liste d\'attente'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            En vous inscrivant, vous acceptez d'être contacté par email concernant nos offres d'abonnement.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
