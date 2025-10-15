'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de confirmation manquant.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch(`/api/newsletter/confirm?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || data.message || 'Une erreur est survenue.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Une erreur est survenue lors de la confirmation.');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Link href="/" className="inline-block mb-6">
          <Image 
            src="/images/logos/SimplyJury_Logo-Horizontal-Bicolore-Bleu-Jaune.svg"
            alt="SimplyJury"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        {status === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d4a70]/10 rounded-full mb-4">
              <Loader2 className="h-8 w-8 text-[#0d4a70] animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
              Confirmation en cours...
            </h1>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous confirmons votre inscription.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090]/10 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-[#13d090]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
              Inscription confirmée !
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Vous recevrez désormais nos actualités, conseils et nouveautés directement dans votre boîte mail.
            </p>
            <Button asChild className="bg-[#0d4a70] hover:bg-[#0c608a] text-white rounded-full px-8">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
              Erreur de confirmation
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="border-[#0d4a70] text-[#0d4a70] hover:bg-[#0d4a70] hover:text-white rounded-full px-6">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
              <Button asChild className="bg-[#0d4a70] hover:bg-[#0c608a] text-white rounded-full px-6">
                <Link href="/#newsletter">Réessayer</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d4a70]/10 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-[#0d4a70] animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
            Chargement...
          </h1>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
