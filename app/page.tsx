'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Users, CheckCircle, Star, Shield, Search, MessageSquare, MessageCircle, Zap, Trophy, Clock, Award, TrendingUp, HeadphonesIcon, Calendar, Mail, User, Newspaper, Linkedin, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup';
import { CookieBanner } from '@/components/cookie-consent';
import { CookieSettingsButton } from '@/components/cookie-consent/cookie-settings-button';
import { motion } from 'framer-motion';
import { FadeInUp, ParallaxSection, FloatingElement, StaggerContainer, CounterAnimation } from '@/components/animations';

export default function HomePage() {
  const [socialUrls, setSocialUrls] = useState({
    linkedinUrl: '#',
    youtubeUrl: '#',
    instagramUrl: '#'
  });

  useEffect(() => {
    // Fetch social network URLs from API
    fetch('/api/settings/social-networks')
      .then(res => res.json())
      .then(data => {
        setSocialUrls({
          linkedinUrl: data.linkedinUrl || '#',
          youtubeUrl: data.youtubeUrl || '#',
          instagramUrl: data.instagramUrl || '#'
        });
      })
      .catch(err => console.error('Error fetching social URLs:', err));
  }, []);

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
                Fonctionnalités
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
                className="bg-[#bea1e5] hover:bg-[#a888d4] text-white rounded-full px-6 py-3 text-lg font-semibold cursor-pointer"
              >
                <Link href="/sign-up">S'inscrire</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-[#f5f5f5] overflow-hidden">
        {/* Decorative elements with parallax */}
        <ParallaxSection speed={0.3} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-[#fdce0f] rounded-full opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-[#bea1e5] rounded-lg opacity-20"></div>
          <div className="absolute top-40 right-10 w-16 h-16 bg-[#13d090] opacity-20" style={{borderRadius: '0 20px 0 20px'}}></div>
        </ParallaxSection>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
              <FadeInUp delay={0.2}>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#13d090]/10 text-[#0d4a70] text-sm font-medium mb-6">
                  <CheckCircle className="w-4 h-4 mr-2 text-[#13d090]" />
                  Plateforme certifiée et sécurisée
                </div>
              </FadeInUp>
              
              <motion.h1 
                className="text-4xl font-bold text-[#0d4a70] tracking-tight sm:text-5xl md:text-6xl leading-tight relative inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="absolute inset-0 bg-[url('/images/hero-section/herosection4-larger.png')] bg-contain bg-no-repeat bg-center left-[114px] -right-6 top-[85px] -bottom-3 w-[80%] h-[75%] z-0"></span>
                <motion.span 
                  className="relative z-10 block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Trouvez un jury qualifié
                </motion.span>
                <motion.span 
                  className="relative z-10 block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  n'a jamais été
                </motion.span>
                <motion.span 
                  className="relative z-10 block text-[#13d090]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  aussi simple
                </motion.span>
              </motion.h1>
              
              <FadeInUp delay={0.8}>
                <p className="mt-6 text-lg text-[#0d4a70] sm:mt-8 sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
                  SimplyJury facilite la mise en relation entre centres de formation et jurys professionnels qualifiés. 
                  Trouvez rapidement l'expertise dont vous avez besoin pour vos certifications.
                </p>
              </FadeInUp>
              
              <FadeInUp delay={1.0}>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    asChild
                    className="bg-[#0d4a70] hover:bg-[#0c608a] text-white px-8 py-4 text-lg rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <Link href="/sign-up">
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={openCalendly}
                    className="border-[#0d4a70] text-[#0d4a70] hover:bg-[#0d4a70] hover:text-white px-8 py-4 text-lg rounded-full font-semibold transition-all duration-200 cursor-pointer"
                  >
                    Prendre rendez-vous
                  </Button>
                </div>
              </FadeInUp>
              
              <FadeInUp delay={1.2}>
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
              </FadeInUp>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-5 flex justify-center">
              <FadeInUp delay={1.2}>
                <div className="relative">
                  {/* Main illustration with floating animation */}
                  <FloatingElement duration={3} yOffset={15}>
                    <div className="w-96 h-96 rounded-3xl relative overflow-hidden">
                      <Image
                        src="/images/hero-section/simplyjury-illustration-V2.png"
                        alt="SimplyJury - Plateforme de mise en relation entre centres de formation et jurys qualifiés"
                        width={384}
                        height={384}
                        className="w-full h-full object-contain rounded-3xl"
                      />
                    </div>
                  </FloatingElement>
                  
                  {/* Floating cards with parallax */}
                  <motion.div 
                    className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-[#13d090]/20"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    <FloatingElement duration={2.5} yOffset={10}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#0d4a70]">Jury trouvé</div>
                          <div className="text-xs text-gray-500">En 2 minutes</div>
                        </div>
                      </div>
                    </FloatingElement>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-[#bea1e5]/20"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                  >
                    <FloatingElement duration={2.8} yOffset={12}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#0d4a70]">Note moyenne</div>
                          <div className="text-xs text-gray-500">4.8/5 ⭐</div>
                        </div>
                      </div>
                    </FloatingElement>
                  </motion.div>
                </div>
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités/Solution Section */}
      <section id="fonctionnalites" className="py-20 bg-[#0d4a70] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                Fonctionnalités / Solution
              </h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Découvrez comment SimplyJury simplifie la gestion de vos certifications
              </p>
            </div>
          </FadeInUp>

          {/* Features Grid with stagger animation and subtle parallax */}
          <ParallaxSection speed={0.95} className="rounded-2xl">
            <StaggerContainer className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-[#13d090] rounded-xl flex items-center justify-center mb-4"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Search className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Recherche de jury</h3>
                <p className="text-sm text-gray-600">Trouvez rapidement des jurys qualifiés par domaine et région</p>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-[#bea1e5] rounded-xl flex items-center justify-center mb-4"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Messagerie intégrée</h3>
                <p className="text-sm text-gray-600">Communiquez directement avec les jurys via notre plateforme</p>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-[#fdce0f] rounded-xl flex items-center justify-center mb-4"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Profils vérifiés</h3>
                <p className="text-sm text-gray-600">Tous les jurys sont qualifiés et leurs compétences vérifiées</p>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-[#ec4899] rounded-xl flex items-center justify-center mb-4"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <Calendar className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="font-semibold text-[#0d4a70] mb-2">Gestion de sessions</h3>
                <p className="text-sm text-gray-600">Organisez et suivez vos sessions de certification facilement</p>
              </motion.div>
            </StaggerContainer>
          </ParallaxSection>
        </div>
      </section>

      {/* Comment ça marche Section */}
      <section id="pour-qui" className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 relative">
            {/* Decorative shapes with parallax */}
            <ParallaxSection speed={0.4} className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-1/4 w-8 h-8 bg-[#bea1e5] opacity-60 rotate-12"></div>
              <div className="absolute top-2 right-1/4 translate-x-10 w-6 h-6 bg-[#fdce0f] rounded-full opacity-70"></div>
              <div className="absolute top-6 right-1/4 translate-x-16 w-5 h-5 bg-[#13d090] opacity-60" style={{borderRadius: '0 8px 0 8px'}}></div>
            </ParallaxSection>
            
            <FadeInUp>
              <h2 className="text-3xl font-bold text-[#0d4a70] sm:text-4xl mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Que vous soyez jury ou organisme de formation, SimplyJury est fait pour vous
              </p>
            </FadeInUp>
          </div>
          
          <ParallaxSection speed={0.97}>
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Pour les Jurys - Slides from left */}
              <motion.div 
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <FadeInUp delay={0.3}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] rounded-full mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0d4a70] mb-2">En tant que Jury</h3>
                  <p className="text-gray-600">Valorisez votre expertise professionnelle</p>
                </div>
              </FadeInUp>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center text-white font-bold"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
                  >
                    1
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Créez votre profil</h4>
                    <p className="text-sm text-gray-600">Renseignez vos domaines d'expertise et vos disponibilités</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center text-white font-bold"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                  >
                    2
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Recevez des demandes</h4>
                    <p className="text-sm text-gray-600">Les organismes de formation vous contactent directement</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 bg-[#13d090] rounded-full flex items-center justify-center text-white font-bold"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.0, type: "spring" }}
                  >
                    3
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Participez aux sessions</h4>
                    <p className="text-sm text-gray-600">Acceptez les missions qui vous conviennent et partagez votre expertise</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Pour les Organismes de Formation - Slides from right */}
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <FadeInUp delay={0.3}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#bea1e5] rounded-full mb-4">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0d4a70] mb-2">En tant qu'Organisme de Formation</h3>
                  <p className="text-gray-600">Trouvez les jurys qualifiés dont vous avez besoin</p>
                </div>
              </FadeInUp>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center text-white font-bold"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
                  >
                    1
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Recherchez un jury</h4>
                    <p className="text-sm text-gray-600">Filtrez par domaine de certification, région et modalités</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center text-white font-bold"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                  >
                    2
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Contactez directement</h4>
                    <p className="text-sm text-gray-600">Envoyez une demande structurée avec tous les détails de votre mission</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 bg-[#bea1e5] rounded-full flex items-center justify-center text-white font-bold"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.0, type: "spring" }}
                  >
                    3
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-[#0d4a70] mb-1">Organisez votre session</h4>
                    <p className="text-sm text-gray-600">Recevez une réponse rapide et planifiez votre session de certification</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Pourquoi choisir SimplyJury - Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#0d4a70] sm:text-4xl mb-4">
                Pourquoi choisir SimplyJury ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des chiffres clés qui témoignent de notre efficacité
              </p>
            </div>
          </FadeInUp>
          
          <ParallaxSection speed={0.96}>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
            <FadeInUp delay={0.2}>
              <div className="text-center">
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] rounded-full mb-4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <div className="text-4xl font-bold text-[#0d4a70] mb-2">
                  <CounterAnimation to={300} suffix="+" duration={1.5} />
                </div>
                <div className="text-gray-600">Nombre de jury disponibles</div>
              </div>
            </FadeInUp>
            
            <FadeInUp delay={0.4}>
              <div className="text-center">
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-[#fdce0f] rounded-full mb-4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Clock className="h-8 w-8 text-white" />
                </motion.div>
                <div className="text-4xl font-bold text-[#0d4a70] mb-2">
                  <CounterAnimation to={3} suffix="h" duration={1.2} />
                </div>
                <div className="text-gray-600">Temps gagné par recherche</div>
              </div>
            </FadeInUp>
            
            <FadeInUp delay={0.6}>
              <div className="text-center">
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-[#bea1e5] rounded-full mb-4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <TrendingUp className="h-8 w-8 text-white" />
                </motion.div>
                <div className="text-4xl font-bold text-[#0d4a70] mb-2">
                  <CounterAnimation to={300} suffix="+" duration={1.5} />
                </div>
                <div className="text-gray-600">Sessions réalisées avec SimplyJury par an</div>
              </div>
            </FadeInUp>
            </div>
          </ParallaxSection>

          <ParallaxSection speed={0.98}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <FadeInUp delay={0.2}>
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="flex-shrink-0"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                  >
                    <div className="w-12 h-12 bg-[#13d090] rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0d4a70] mb-2">
                      Profils vérifiés
                    </h3>
                    <p className="text-gray-600">
                      Tous nos jurys sont qualifiés et leurs compétences sont vérifiées pour garantir la qualité de vos certifications.
                    </p>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.4}>
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="flex-shrink-0"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                  >
                    <div className="w-12 h-12 bg-[#bea1e5] rounded-xl flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0d4a70] mb-2">
                      Recherche intelligente
                    </h3>
                    <p className="text-gray-600">
                      Filtrez par domaine, région, modalités et trouvez rapidement le jury parfait pour votre session.
                    </p>
                  </div>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.6}>
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="flex-shrink-0"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
                  >
                    <div className="w-12 h-12 bg-[#fdce0f] rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#0d4a70] mb-2">
                      Messagerie intégrée
                    </h3>
                    <p className="text-gray-600">
                      Communiquez directement avec les jurys via notre plateforme sécurisée et organisez vos sessions facilement.
                    </p>
                  </div>
                </div>
              </FadeInUp>
            </div>

            <FadeInUp delay={0.4}>
              <div className="relative">
                <motion.div 
                  className="bg-gradient-to-br from-[#0d4a70] to-[#0c608a] rounded-2xl shadow-xl p-8 relative z-10"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center">
                    <motion.div 
                      className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
                    >
                      <Trophy className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Essai gratuit
                    </h3>
                    <p className="text-blue-100 mb-8">
                      Découvrez SimplyJury sans engagement. Testez toutes nos fonctionnalités pendant 30 jours.
                    </p>
                    <Button size="lg" asChild className="bg-white text-[#0d4a70] hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold cursor-pointer">
                      <Link href="/sign-up">Commencer l'essai gratuit</Link>
                    </Button>
                  </div>
                </motion.div>
                <ParallaxSection speed={0.2}>
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#bea1e5] rounded-full opacity-20"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#fdce0f] rounded-full opacity-20"></div>
                </ParallaxSection>
              </div>
            </FadeInUp>
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Support & Demo Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParallaxSection speed={0.97}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Support Client */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <FadeInUp delay={0.2}>
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-[#13d090] rounded-full flex items-center justify-center flex-shrink-0">
                    <HeadphonesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0d4a70] mb-2">Support client</h3>
                    <p className="text-gray-600">Posez-nous vos questions !</p>
                  </div>
                </div>
              </FadeInUp>
              
              <div className="bg-[#f8f9fa] rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <div className="w-10 h-10 bg-[#13d090] rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 flex-1">
                      <p className="text-sm text-gray-700">Bonjour Pierre, comment puis-je vous aider ?</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <div className="w-10 h-10 bg-[#0d4a70] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 flex-1">
                      <p className="text-sm text-gray-700">Est-ce que je peux passer sur SimplyJury Pro ?</p>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <FadeInUp delay={0.8}>
                <div className="text-center">
                  <h4 className="font-semibold text-[#0d4a70] mb-4">Une équipe à votre disposition</h4>
                  <p className="text-gray-600 mb-6">
                    La satisfaction de nos clients est notre priorité. Notre équipe est disponible pour vous aider et répondre à vos questions.
                  </p>
                  <Button asChild className="bg-[#13d090] hover:bg-[#10b87a] text-white rounded-full px-6 py-3 text-lg font-semibold cursor-pointer">
                    <Link href="/contact">Contacter l'équipe</Link>
                  </Button>
                </div>
              </FadeInUp>
            </motion.div>

            {/* Démo Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <FadeInUp delay={0.2}>
                <div className="text-center mb-8">
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 bg-[#0d4a70] rounded-full mb-4"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                  >
                    <Calendar className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#0d4a70] mb-2">
                    Besoin d'en savoir plus ?
                  </h3>
                  <p className="text-xl text-gray-700 mb-4">
                    Participez à l'une de nos démos !
                  </p>
                </div>
              </FadeInUp>
              
              <FadeInUp delay={0.5}>
                <div className="bg-[#f8f9fa] rounded-xl p-6 mb-6">
                  <p className="text-gray-700 mb-4">
                    Chaque semaine, découvrez comment SimplyJury peut vous aider à trouver rapidement des jurys qualifiés pour vos certifications.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Sessions disponibles chaque semaine</span>
                  </div>
                </div>
              </FadeInUp>
              
              <FadeInUp delay={0.7}>
                <Button 
                  onClick={openCalendly}
                  size="lg" 
                  className="w-full bg-[#0d4a70] hover:bg-[#0c608a] text-white rounded-full px-8 py-4 text-lg font-semibold cursor-pointer"
                >
                  S'inscrire à une démo
                </Button>
              </FadeInUp>
            </motion.div>
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-[#f8f9fa] to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
              {/* Highlighter background */}
              <div className="absolute top-[248px] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[url('/images/hero-section/herosection4-larger-whitebckgrnd.png')] bg-contain bg-no-repeat bg-center opacity-90 z-0"></div>
              
              <div className="text-center mb-8 relative z-10">
                {/* Decorative shapes with parallax */}
                <ParallaxSection speed={0.3} className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-12 left-1/4 w-7 h-7 bg-[#fdce0f] opacity-60 rotate-45"></div>
                  <div className="absolute top-16 left-1/4 -translate-x-8 w-5 h-5 bg-[#bea1e5] rounded-full opacity-70"></div>
                  <div className="absolute top-10 left-1/4 translate-x-6 w-6 h-6 bg-[#13d090] opacity-60" style={{borderRadius: '0 10px 0 10px'}}></div>
                </ParallaxSection>
                
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] rounded-full mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  <Newspaper className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-[#0d4a70] mb-4">
                  Restez informé
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Recevez nos actualités, conseils pratiques et nouveautés directement dans votre boîte mail. 
                  Découvrez comment optimiser vos certifications et restez à jour sur les évolutions du secteur.
                </p>
              </div>

              <FadeInUp delay={0.3}>
                <div className="max-w-xl mx-auto relative z-10">
                  <NewsletterSignup />
                </div>
              </FadeInUp>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100 relative z-10">
                <div className="text-center">
                  <motion.div 
                    className="inline-flex items-center justify-center w-12 h-12 bg-[#0d4a70]/10 rounded-full mb-3"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
                  >
                    <Zap className="h-6 w-6 text-[#0d4a70]" />
                  </motion.div>
                  <h3 className="font-semibold text-[#0d4a70] mb-1">Nouveautés produit</h3>
                  <p className="text-sm text-gray-600">Découvrez nos nouvelles fonctionnalités</p>
                </div>
                <div className="text-center">
                  <motion.div 
                    className="inline-flex items-center justify-center w-12 h-12 bg-[#13d090]/10 rounded-full mb-3"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
                  >
                    <Award className="h-6 w-6 text-[#13d090]" />
                  </motion.div>
                  <h3 className="font-semibold text-[#0d4a70] mb-1">Conseils & astuces</h3>
                  <p className="text-sm text-gray-600">Optimisez vos processus de certification</p>
                </div>
                <div className="text-center">
                  <motion.div 
                    className="inline-flex items-center justify-center w-12 h-12 bg-[#bea1e5]/10 rounded-full mb-3"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
                  >
                    <TrendingUp className="h-6 w-6 text-[#bea1e5]" />
                  </motion.div>
                  <h3 className="font-semibold text-[#0d4a70] mb-1">Actualités secteur</h3>
                  <p className="text-sm text-gray-600">Restez informé des évolutions</p>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="tarif" className="py-20 bg-[#0d4a70] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d4a70] to-[#0a3a5a]"></div>
        <ParallaxSection speed={0.2} className="absolute inset-0">
          <FloatingElement duration={4} yOffset={20}>
            <div className="absolute top-10 left-10 w-20 h-20 bg-[#13d090] rounded-full opacity-10"></div>
          </FloatingElement>
          <FloatingElement duration={5} yOffset={25}>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#fdce0f] rounded-full opacity-10"></div>
          </FloatingElement>
        </ParallaxSection>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
              Prêt à simplifier vos certifications ?
            </h2>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Rejoignez les centres de formation qui font confiance à SimplyJury pour trouver leurs jurys qualifiés.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild className="bg-[#bea1e5] hover:bg-[#a888d4] text-white px-8 py-4 rounded-full font-semibold text-lg cursor-pointer">
                  <Link href="/sign-up">
                    Démarrer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={openCalendly}
                  size="lg" 
                  className="bg-white text-[#0d4a70] hover:bg-gray-100 border-2 border-white px-8 py-4 rounded-full font-semibold text-lg cursor-pointer"
                >
                  Prendre rendez-vous
                </Button>
              </motion.div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d4a70] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center mb-4">
                <Image 
                  src="/images/logos/SimplyJury_Logo-Horizontal-Bicolore-Bleu-Jaune.svg"
                  alt="SimplyJury"
                  width={140}
                  height={40}
                  className="h-8 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-sm text-blue-100 mb-4">
                La plateforme qui simplifie la mise en relation entre centres de formation et jurys qualifiés.
              </p>
              {/* Social Media */}
              <div className="flex space-x-4">
                <a 
                  href={socialUrls.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href={socialUrls.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a 
                  href={socialUrls.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Produit */}
            <div>
              <h3 className="font-semibold text-white mb-4">Produit</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>
                  <a href="#fonctionnalites" className="hover:text-white transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <a href="#" onClick={openCalendly} className="hover:text-white transition-colors cursor-pointer">
                    Démo
                  </a>
                </li>
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h3 className="font-semibold text-white mb-4">Entreprise</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>
                  <a href="#a-propos" className="hover:text-white transition-colors">
                    À propos
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h3 className="font-semibold text-white mb-4">Ressources</h3>
              <ul className="space-y-2 text-sm text-blue-100">
                <li>
                  <Link href="/sign-in" className="hover:text-white transition-colors">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-white transition-colors">
                    S'inscrire
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-100">
              <p>© {new Date().getFullYear()} SimplyJury. Tous droits réservés.</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  CGU
                </Link>
                <CookieSettingsButton />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieBanner />

      </main>
    </>
  );
}
