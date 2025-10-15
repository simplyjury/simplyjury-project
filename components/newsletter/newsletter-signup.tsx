'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Veuillez entrer votre email.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'homepage' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            className="pl-10 h-12 rounded-full border-gray-300 focus:border-[#0d4a70] focus:ring-[#0d4a70]"
          />
        </div>
        <Button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="bg-[#0d4a70] hover:bg-[#0c608a] text-white px-8 h-12 rounded-full font-medium transition-all duration-200 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Inscrit !
            </>
          ) : (
            "S'inscrire"
          )}
        </Button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-start space-x-2 ${
            status === 'success'
              ? 'bg-[#13d090]/10 text-[#0d4a70]'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle className="h-5 w-5 text-[#13d090] flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{message}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        En vous inscrivant, vous acceptez de recevoir nos newsletters et vous reconnaissez avoir pris connaissance de notre{' '}
        <a href="/privacy" className="underline hover:text-[#0d4a70]">
          politique de confidentialité
        </a>
        . Vous pouvez vous désinscrire à tout moment.
      </p>
    </div>
  );
}
