'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    centerName: '',
    contactName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({
        centerName: '',
        contactName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="font-jakarta min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/logos/SimplyJury_Logo-Horizontal-Bicolore-Bleu-Jaune.svg"
                alt="SimplyJury"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="flex items-center space-x-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Se connecter
              </Link>
              <Button 
                asChild 
                className="bg-[#bea1e5] hover:bg-[#a888d4] text-white rounded-full px-6 py-3 text-lg font-semibold cursor-pointer"
              >
                <Link href="/sign-up">S'inscrire</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-[#0d4a70] to-[#0c608a] overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#13d090] rounded-full opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#fdce0f] rounded-full opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">
              Contactez-nous
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Une question ? Un besoin spécifique ? Notre équipe est à votre écoute pour vous accompagner.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#0d4a70] mb-4">
                  Parlons de votre projet
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Que vous soyez un centre de formation à la recherche de jurys qualifiés ou que vous ayez des questions sur notre plateforme, nous sommes là pour vous aider.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#13d090] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0d4a70] mb-1">Email</h3>
                      <p className="text-gray-600">contact@simplyjury.fr</p>
                      <p className="text-sm text-gray-500 mt-1">Réponse sous 24h ouvrées</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#bea1e5] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0d4a70] mb-1">Téléphone</h3>
                      <p className="text-gray-600">+33 1 23 45 67 89</p>
                      <p className="text-sm text-gray-500 mt-1">Lun-Ven : 9h-18h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#fdce0f] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0d4a70] mb-1">Adresse</h3>
                      <p className="text-gray-600">
                        123 Avenue de la République<br />
                        75011 Paris, France
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-[#0d4a70] to-[#0c608a] rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">
                  Besoin d'une démo ?
                </h3>
                <p className="text-blue-100 mb-6">
                  Découvrez comment SimplyJury peut simplifier votre recherche de jurys qualifiés. Réservez une démonstration personnalisée avec notre équipe.
                </p>
                <Button 
                  asChild
                  className="bg-white text-[#0d4a70] hover:bg-gray-100 rounded-full px-6 py-3 font-semibold cursor-pointer"
                >
                  <Link href="/">Réserver une démo</Link>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-6">
                Envoyez-nous un message
              </h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-[#13d090]/10 border border-[#13d090] rounded-xl flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-[#13d090] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#13d090]">Message envoyé avec succès !</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="font-semibold text-red-600">
                    Une erreur est survenue. Veuillez réessayer.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="centerName" className="block text-sm font-medium text-[#0d4a70] mb-2">
                      Nom du centre <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="centerName"
                      name="centerName"
                      type="text"
                      required
                      value={formData.centerName}
                      onChange={handleChange}
                      placeholder="Centre de Formation XYZ"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-[#0d4a70] mb-2">
                      Votre nom <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="contactName"
                      name="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Jean Dupont"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#0d4a70] mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@centre.fr"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[#0d4a70] mb-2">
                      Téléphone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="06 12 34 56 78"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#0d4a70] mb-2">
                    Sujet <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Demande d'information sur vos services"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#0d4a70] mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre demande..."
                    rows={6}
                    className="w-full resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0d4a70] hover:bg-[#0c608a] text-white rounded-full px-8 py-4 text-lg font-semibold cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d4a70] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/images/logos/SimplyJury_Logo-Horizontal-Bicolore-Bleu-Jaune.svg"
                alt="SimplyJury"
                width={140}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-blue-100">
              © {new Date().getFullYear()} SimplyJury. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
