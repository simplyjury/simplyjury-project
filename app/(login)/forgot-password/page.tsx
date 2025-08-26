'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { requestPasswordResetAction, ActionState } from '../simplyjury-actions';

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestPasswordResetAction,
    { error: '', success: '' }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d4a70] rounded-full mb-4">
            <div className="text-white text-2xl font-bold">👌</div>
          </div>
          <h1 className="text-3xl font-bold text-[#0d4a70] font-jakarta mb-2">
            SimplyJury
          </h1>
          <p className="text-[#0d4a70]/70 font-jakarta">
            Réinitialisation du mot de passe
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-[#0d4a70] font-jakarta text-center">
              Mot de passe oublié ?
            </CardTitle>
            <CardDescription className="text-center text-[#0d4a70]/70 font-jakarta">
              Saisissez votre adresse email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.success && (
              <div className="p-4 bg-[#ccf5e8] border border-[#13d090]/30 rounded-lg">
                <p className="text-sm text-[#0d4a70] font-jakarta">{state.success}</p>
              </div>
            )}

            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-jakarta">{state.error}</p>
              </div>
            )}

            <form className="space-y-4" action={formAction}>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#0d4a70] font-jakarta">
                  Adresse email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state?.email}
                  required
                  maxLength={255}
                  className="h-12 border-2 border-gray-200 rounded-xl focus:border-[#13d090] focus:ring-[#13d090]/20 font-jakarta"
                  placeholder="votre@email.com"
                />
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#0d4a70] hover:bg-[#0c608a] text-white font-medium rounded-xl transition-colors font-jakarta"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>
            </form>

            {/* Retour à la connexion */}
            <div className="text-center pt-4">
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm text-[#13d090] hover:text-[#0d4a70] transition-colors font-jakarta"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-[#0d4a70]/50 font-jakarta">
          Le lien de réinitialisation sera valide pendant 24 heures
        </div>
      </div>
    </div>
  );
}
