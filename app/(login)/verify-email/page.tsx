'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmailAction } from '../simplyjury-actions';
import { useState, useEffect, Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        const success = await verifyEmailAction(token);
        setStatus(success ? 'success' : 'error');
      } catch (error) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0d4a70] font-jakarta mb-2">
              Lien invalide
            </h2>
            <p className="text-[#0d4a70]/70 font-jakarta mb-4">
              Le lien de vérification est invalide ou a expiré.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-12 px-6 bg-[#0d4a70] hover:bg-[#0c608a] text-white font-medium rounded-xl transition-colors font-jakarta"
            >
              Retour à la connexion
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-16 h-16 text-[#0d4a70] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-[#0d4a70] font-jakarta mb-2">
              Vérification en cours...
            </h2>
            <p className="text-[#0d4a70]/70 font-jakarta">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-[#13d090] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0d4a70] font-jakarta mb-2">
              Email vérifié avec succès !
            </h2>
            <p className="text-[#0d4a70]/70 font-jakarta mb-4">
              Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter à votre compte.
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
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0d4a70] font-jakarta mb-2">
            Erreur de vérification
          </h2>
          <p className="text-[#0d4a70]/70 font-jakarta mb-4">
            Une erreur est survenue lors de la vérification de votre email. Le lien peut être expiré ou invalide.
          </p>
          <div className="space-y-3">
            <Link
              href="/sign-up"
              className="block w-full h-12 px-6 bg-[#0d4a70] hover:bg-[#0c608a] text-white font-medium rounded-xl transition-colors font-jakarta flex items-center justify-center"
            >
              Créer un nouveau compte
            </Link>
            <Link
              href="/sign-in"
              className="block w-full h-12 px-6 border-2 border-[#13d090] text-[#13d090] hover:bg-[#13d090] hover:text-white font-medium rounded-xl transition-colors font-jakarta flex items-center justify-center"
            >
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#0d4a70]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
