'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { resetPasswordAction, ActionState } from '../simplyjury-actions';
import { useState, Suspense } from 'react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    { error: '', success: '' }
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-[#0d4a70] font-jakarta mb-2">
              Lien invalide
            </h2>
            <p className="text-[#0d4a70]/70 font-jakarta mb-4">
              Le lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center h-12 px-6 bg-[#0d4a70] hover:bg-[#0c608a] text-white font-medium rounded-xl transition-colors font-jakarta"
            >
              Demander un nouveau lien
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-[#13d090] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0d4a70] font-jakarta mb-2">
              Mot de passe réinitialisé !
            </h2>
            <p className="text-[#0d4a70]/70 font-jakarta mb-4">
              Votre mot de passe a été réinitialisé avec succès.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-12 px-6 bg-[#0d4a70] hover:bg-[#0c608a] text-white font-medium rounded-xl transition-colors font-jakarta"
            >
              Se connecter
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Nouveau mot de passe
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-[#0d4a70] font-jakarta text-center">
              Réinitialiser le mot de passe
            </CardTitle>
            <CardDescription className="text-center text-[#0d4a70]/70 font-jakarta">
              Saisissez votre nouveau mot de passe
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-jakarta">{state.error}</p>
              </div>
            )}

            <form className="space-y-4" action={formAction}>
              <input type="hidden" name="token" value={token} />
              
              {/* Nouveau mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#0d4a70] font-jakarta">
                  Nouveau mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-[#13d090] focus:ring-[#13d090]/20 font-jakarta pr-12"
                    placeholder="Créez un mot de passe sécurisé"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0d4a70] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-[#0d4a70]/60 font-jakarta">
                  8 caractères minimum avec majuscule, minuscule et chiffre
                </p>
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
                    Réinitialisation en cours...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-[#0d4a70]/50 font-jakarta">
          Votre mot de passe doit être sécurisé et unique
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#0d4a70]" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
