'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { signUpAction, ActionState } from './simplyjury-actions';
import { useState } from 'react';

interface SimplyJuryLoginProps {
  mode?: 'signin' | 'signup';
}

export function SimplyJuryLogin({ mode = 'signin' }: SimplyJuryLoginProps) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<string>('centre');
  
  // For sign-up, use server action; for sign-in, use API route
  const [state, formAction] = useActionState<ActionState, FormData>(
    signUpAction,
    { error: '', success: '' }
  );

  const isSignUp = mode === 'signup';

  // Handle sign-in via API route
  const handleSignIn = async (formData: FormData) => {
    setPending(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      // Success - redirect to the appropriate page
      router.push(data.redirectPath || '/dashboard');
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (isSignUp) {
      // Use server action for sign-up
      formAction(formData);
    } else {
      // Use API route for sign-in
      await handleSignIn(formData);
    }
  };

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
            Trouvez un jury qualifié n'a jamais été aussi simple
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-[#0d4a70] font-jakarta text-center">
              {isSignUp ? 'Créer votre compte' : 'Connexion'}
            </CardTitle>
            <CardDescription className="text-center text-[#0d4a70]/70 font-jakarta">
              {isSignUp 
                ? 'Rejoignez la communauté SimplyJury'
                : 'Accédez à votre espace personnel'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {(success || (isSignUp && state?.success)) && (
              <div className="p-4 bg-[#ccf5e8] border border-[#13d090]/30 rounded-lg">
                <p className="text-sm text-[#0d4a70] font-jakarta">{success || state?.success}</p>
              </div>
            )}

            {(error || (isSignUp && state?.error)) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-jakarta">{error || state?.error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              
              {/* Nom (inscription uniquement) */}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-[#0d4a70] font-jakarta">
                    Nom complet *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    defaultValue={state?.name}
                    required
                    maxLength={100}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-[#13d090] focus:ring-[#13d090]/20 font-jakarta"
                    placeholder="Votre nom complet"
                  />
                  <p className="text-xs text-[#0d4a70]/60 font-jakarta">
                    {selectedUserType === 'centre' 
                      ? 'Utilisé par défaut comme responsable pédagogique'
                      : 'Utilisé pour votre profil professionnel'
                    }
                  </p>
                </div>
              )}

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
                {isSignUp && (
                  <p className="text-xs text-[#0d4a70]/60 font-jakarta">
                    {selectedUserType === 'centre' 
                      ? 'Utilisé par défaut comme email de contact professionnel'
                      : 'Utilisé pour votre profil et les contacts'
                    }
                  </p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#0d4a70] font-jakarta">
                  Mot de passe *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    defaultValue={state?.password}
                    required
                    minLength={8}
                    maxLength={100}
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-[#13d090] focus:ring-[#13d090]/20 font-jakarta pr-12"
                    placeholder={isSignUp ? 'Créez un mot de passe sécurisé' : 'Votre mot de passe'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0d4a70] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-[#0d4a70]/60 font-jakarta">
                    8 caractères minimum avec majuscule, minuscule et chiffre
                  </p>
                )}
              </div>

              {/* Type d'utilisateur (inscription uniquement) */}
              {isSignUp && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-[#0d4a70] font-jakarta">
                    Je suis *
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative">
                      <input
                        type="radio"
                        name="userType"
                        value="centre"
                        defaultChecked={state?.userType === 'centre'}
                        className="sr-only peer"
                        required
                        onChange={(e) => setSelectedUserType(e.target.value)}
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:border-[#13d090] peer-checked:bg-[#ccf5e8]/30 hover:border-[#13d090]/50">
                        <div className="text-center">
                          <div className="text-2xl mb-2">🏫</div>
                          <div className="font-medium text-[#0d4a70] font-jakarta text-sm">
                            Centre de formation
                          </div>
                          <div className="text-xs text-[#0d4a70]/60 font-jakarta mt-1">
                            Je recherche des jurys
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label className="relative">
                      <input
                        type="radio"
                        name="userType"
                        value="jury"
                        defaultChecked={state?.userType === 'jury'}
                        className="sr-only peer"
                        required
                        onChange={(e) => setSelectedUserType(e.target.value)}
                      />
                      <div className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:border-[#13d090] peer-checked:bg-[#ccf5e8]/30 hover:border-[#13d090]/50">
                        <div className="text-center">
                          <div className="text-2xl mb-2">👨‍⚖️</div>
                          <div className="font-medium text-[#0d4a70] font-jakarta text-sm">
                            Jury professionnel
                          </div>
                          <div className="text-xs text-[#0d4a70]/60 font-jakarta mt-1">
                            Je propose mes services
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full h-12 bg-[#0d4a70] hover:bg-[#0c608a] text-white font-medium rounded-xl transition-colors font-jakarta"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {isSignUp ? 'Création en cours...' : 'Connexion en cours...'}
                  </>
                ) : isSignUp ? (
                  'Créer mon compte'
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* Lien mot de passe oublié (connexion uniquement) */}
              {!isSignUp && (
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#13d090] hover:text-[#0d4a70] transition-colors font-jakarta"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}
            </form>

            {/* Séparateur et lien vers l'autre mode */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#0d4a70]/60 font-jakarta">
                  {isSignUp ? 'Déjà inscrit ?' : 'Nouveau sur SimplyJury ?'}
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href={`${isSignUp ? '/sign-in' : '/sign-up'}${redirect ? `?redirect=${redirect}` : ''}`}
                className="inline-flex items-center justify-center w-full h-12 border-2 border-[#13d090] text-[#13d090] hover:bg-[#13d090] hover:text-white rounded-xl transition-colors font-medium font-jakarta"
              >
                {isSignUp ? 'Se connecter à mon compte' : 'Créer un compte gratuit'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-[#0d4a70]/50 font-jakarta">
          En vous inscrivant, vous acceptez nos conditions d'utilisation
        </div>
      </div>
    </div>
  );
}
