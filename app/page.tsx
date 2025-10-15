'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Users, CheckCircle, Star, Shield, Search, MessageSquare, MessageCircle, Zap, Trophy, Clock, Award, TrendingUp, HeadphonesIcon, Calendar, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect } from 'react';
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup';

export default function HomePage() {
  const openCalendly = () => {
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: 'https://calendly.com/cedric-kerbidi/reunion-information-webwiz'
      });
    }
  };

  return (
    <>
      {/* Calendly CSS */}
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      
      {/* Calendly Script */}
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js" 
        strategy="lazyOnload"
      />

      <main className="font-jakarta">
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
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#fonctionnalites" className="text-sm font-medium text-gray-700 hover:text-[#0d4a70] transition-colors">
                Fonctionnalités / Solution
              </a>
              <a href="#pour-qui" className="text-sm font-medium text-gray-700 hover:text-[#0d4a70] transition-colors">
                Pour qui
              </a>
              <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-[#0d4a70] transition-colors">
                Tarif
              </Link>
              <a href="#a-propos" className="text-sm font-medium text-gray-700 hover:text-[#0d4a70] transition-colors">
                À propos
              </a>
            </nav>

            <div className="flex items-center space-x-3">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Se connecter
              </Link>
              <Button 
                asChild 
                className="bg-[#ec4899] hover:bg-[#db2777] text-white rounded-full px-6"
              >
                <Link href="/sign-up">Démarrer</Link>
              </Button>
              <Button 
                onClick={openCalendly}
                variant="outline" 
                className="border-[#0d4a70] text-[#0d4a70] hover:bg-[#0d4a70] hover:text-white rounded-full px-6"
              >
                Prendre rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#edf6f9] via-white to-[#e8faf5] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#fdce0f] rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#bea1e5] rounded-lg opacity-20"></div>
        <div className="absolute top-40 right-10 w-16 h-16 bg-[#13d090] opacity-20" style={{borderRadius: '0 20px 0 20px'}}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#13d090]/10 text-[#0d4a70] text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4 mr-2 text-[#13d090]" />
                Plateforme certifiée et sécurisée
              </div>
              
              <h1 className="text-4xl font-bold text-[#0d4a70] tracking-tight sm:text-5xl md:text-6xl leading-tight">
                Trouvez un jury qualifié
                <span className="block relative">
                  <span className="relative z-10">n'a jamais été</span>
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[#fdce0f] opacity-60 -rotate-1"></div>
                </span>
                <span className="block text-[#13d090]">aussi simple</span>
              </h1>
              
              <p className="mt-6 text-lg text-[#0d4a70] sm:mt-8 sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
                SimplyJury facilite la mise en relation entre centres de formation et jurys professionnels qualifiés. 
                Trouvez rapidement l'expertise dont vous avez besoin pour vos certifications.
              </p>
              
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-[#0d4a70] hover:bg-[#0c608a] text-white px-8 py-4 text-lg rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Link href="/sign-up">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#0d4a70] text-[#0d4a70] hover:bg-[#0d4a70] hover:text-white px-8 py-4 text-lg rounded-full font-medium transition-all duration-200"
                >
                  Découvrir la plateforme
                </Button>
              </div>
              
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-[#0d4a70]">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-[#fdce0f] mr-1" />
                  <span className="font-medium">1 contact gratuit</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-[#13d090] mr-1" />
                  <span className="font-medium">Profils vérifiés</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-5 flex justify-center">
              <div className="relative">
                {/* Main illustration */}
                <div className="w-96 h-96 rounded-3xl relative overflow-hidden">
                  <Image
                    src="/images/hero-section/simplyjury-illustration-V2.png"
                    alt="SimplyJury - Plateforme de mise en relation entre centres de formation et jurys qualifiés"
                    width={384}
                    height={384}
                    className="w-full h-full object-contain rounded-3xl"
                  />
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-[#13d090]/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#0d4a70]">Jury trouvé</div>
                      <div className="text-xs text-gray-500">En 2 minutes</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-[#bea1e5]/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#0d4a70]">Note moyenne</div>
                      <div className="text-xs text-gray-500">4.8/5 ⭐</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités/Solution Section */}
      <section id="fonctionnalites" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0d4a70] sm:text-4xl mb-4">
              Fonctionnalités / Solution
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez comment SimplyJury simplifie la gestion de vos certifications
            </p>
          </div>

          {/* Tabs inspired by Indy */}
          <div className="bg-[#f8f9fa] rounded-2xl p-8">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#13d090] rounded-xl flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Recherche de jury</h3>
                <p className="text-sm text-gray-600">Trouvez rapidement des jurys qualifiés par domaine et région</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#bea1e5] rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Messagerie intégrée</h3>
                <p className="text-sm text-gray-600">Communiquez directement avec les jurys via notre plateforme</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#fdce0f] rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Profils vérifiés</h3>
                <p className="text-sm text-gray-600">Tous les jurys sont qualifiés et leurs compétences vérifiées</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#ec4899] rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Gestion de sessions</h3>
                <p className="text-sm text-gray-600">Organisez et suivez vos sessions de certification facilement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche Section */}
      <section id="pour-qui" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0d4a70] sm:text-4xl mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Que vous soyez jury ou organisme de formation, SimplyJury est fait pour vous
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Pour les Jurys */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] rounded-full mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0d4a70] mb-2">En tant que Jury</h3>
                <p className="text-gray-600">Valorisez votre expertise professionnelle</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Créez votre profil</h4>
                    <p className="text-sm text-gray-600">Renseignez vos domaines d'expertise et vos disponibilités</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Recevez des demandes</h4>
                    <p className="text-sm text-gray-600">Les organismes de formation vous contactent directement</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Participez aux sessions</h4>
                    <p className="text-sm text-gray-600">Acceptez les missions qui vous conviennent et partagez votre expertise</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pour les Organismes de Formation */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#bea1e5] rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0d4a70] mb-2">En tant qu'Organisme de Formation</h3>
                <p className="text-gray-600">Trouvez les jurys qualifiés dont vous avez besoin</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Recherchez un jury</h4>
                    <p className="text-sm text-gray-600">Filtrez par domaine de certification, région et modalités</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Contactez directement</h4>
                    <p className="text-sm text-gray-600">Envoyez une demande structurée avec tous les détails de votre mission</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Organisez votre session</h4>
                    <p className="text-sm text-gray-600">Recevez une réponse rapide et planifiez votre session de certification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir SimplyJury - Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0d4a70] sm:text-4xl mb-4">
              Pourquoi choisir SimplyJury ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Des chiffres clés qui témoignent de notre efficacité
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#0d4a70] mb-2">300+</div>
              <div className="text-gray-600">Nombre de jury disponibles</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fdce0f] rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#0d4a70] mb-2">3h</div>
              <div className="text-gray-600">Temps gagné par recherche</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#bea1e5] rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-[#0d4a70] mb-2">300+</div>
              <div className="text-gray-600">Sessions réalisées avec SimplyJury par an</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#13d090] rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0d4a70] mb-2">
                    Profils vérifiés
                  </h3>
                  <p className="text-gray-600">
                    Tous nos jurys sont qualifiés et leurs compétences sont vérifiées pour garantir la qualité de vos certifications.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#bea1e5] rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0d4a70] mb-2">
                    Recherche intelligente
                  </h3>
                  <p className="text-gray-600">
                    Filtrez par domaine, région, modalités et trouvez rapidement le jury parfait pour votre session.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#fdce0f] rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0d4a70] mb-2">
                    Messagerie intégrée
                  </h3>
                  <p className="text-gray-600">
                    Communiquez directement avec les jurys via notre plateforme sécurisée et organisez vos sessions facilement.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#0d4a70] to-[#0c608a] rounded-2xl shadow-xl p-8 relative z-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Essai gratuit
                  </h3>
                  <p className="text-blue-100 mb-8">
                    Découvrez SimplyJury sans engagement. Testez toutes nos fonctionnalités pendant 30 jours.
                  </p>
                  <Button size="lg" asChild className="bg-white text-[#0d4a70] hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold">
                    <Link href="/sign-up">Commencer l'essai gratuit</Link>
                  </Button>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#bea1e5] rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#fdce0f] rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Demo Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Support Client */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-[#13d090] rounded-full flex items-center justify-center flex-shrink-0">
                  <HeadphonesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0d4a70] mb-2">Support client</h3>
                  <p className="text-gray-600">Posez-nous vos questions !</p>
                </div>
              </div>
              
              <div className="bg-[#f8f9fa] rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-[#0d4a70]">👋</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 flex-1">
                      <p className="text-sm text-gray-700">Bonjour Pierre, comment puis-je vous aider ?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-[#0d4a70]">👤</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 flex-1">
                      <p className="text-sm text-gray-700">Est-ce que je peux passer sur SimplyJury Pro ?</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="font-semibold text-[#0d4a70] mb-4">Une équipe à votre disposition</h4>
                <p className="text-gray-600 mb-6">
                  La satisfaction de nos clients est notre priorité. Notre équipe est disponible pour vous aider et répondre à vos questions.
                </p>
                <Button asChild className="bg-[#13d090] hover:bg-[#10b87a] text-white rounded-full px-6">
                  <Link href="#contact">Contacter l'équipe</Link>
                </Button>
              </div>
            </div>

            {/* Démo Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d4a70] rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0d4a70] mb-2">
                  Besoin d'en savoir plus ?
                </h3>
                <p className="text-xl text-gray-700 mb-4">
                  Participez à l'une de nos démos !
                </p>
              </div>
              
              <div className="bg-[#f8f9fa] rounded-xl p-6 mb-6">
                <p className="text-gray-700 mb-4">
                  Chaque semaine, découvrez comment SimplyJury peut vous aider à trouver rapidement des jurys qualifiés pour vos certifications.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Sessions disponibles chaque semaine</span>
                </div>
              </div>
              
              <Button 
                onClick={openCalendly}
                size="lg" 
                className="w-full bg-[#0d4a70] hover:bg-[#0c608a] text-white rounded-full py-6 text-lg font-semibold"
              >
                S'inscrire à une démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] rounded-full mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#0d4a70] mb-4">
                Restez informé
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Recevez nos actualités, conseils pratiques et nouveautés directement dans votre boîte mail. 
                Découvrez comment optimiser vos certifications et restez à jour sur les évolutions du secteur.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <NewsletterSignup />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0d4a70]/10 rounded-full mb-3">
                  <Zap className="h-6 w-6 text-[#0d4a70]" />
                </div>
                <h3 className="font-semibold text-[#0d4a70] mb-1">Nouveautés produit</h3>
                <p className="text-sm text-gray-600">Découvrez nos nouvelles fonctionnalités</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#13d090]/10 rounded-full mb-3">
                  <Award className="h-6 w-6 text-[#13d090]" />
                </div>
                <h3 className="font-semibold text-[#0d4a70] mb-1">Conseils & astuces</h3>
                <p className="text-sm text-gray-600">Optimisez vos processus de certification</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#bea1e5]/10 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6 text-[#bea1e5]" />
                </div>
                <h3 className="font-semibold text-[#0d4a70] mb-1">Actualités secteur</h3>
                <p className="text-sm text-gray-600">Restez informé des évolutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="tarif" className="py-20 bg-[#0d4a70] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d4a70] to-[#0a3a5a]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Prêt à simplifier vos certifications ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Rejoignez les centres de formation qui font confiance à SimplyJury pour trouver leurs jurys qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-[#ec4899] hover:bg-[#db2777] text-white px-8 py-4 rounded-full font-semibold text-lg">
              <Link href="/sign-up">
                Démarrer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              onClick={openCalendly}
              size="lg" 
              className="bg-white text-[#0d4a70] hover:bg-gray-100 border-2 border-white px-8 py-4 rounded-full font-semibold text-lg"
            >
              Prendre rendez-vous
            </Button>
          </div>
        </div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#13d090] rounded-full opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#fdce0f] rounded-full opacity-10"></div>
      </section>

      </main>
    </>
  );
}
