import { Button } from "@/components/ui/button";
import { ArrowRight, Search, MessageCircle, CheckCircle, Users, Clock, TrendingUp, Shield, Zap, MessageSquare, Trophy, Star } from "lucide-react";

export default function HomePage() {
  return (
    <main className="font-jakarta">
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
                  className="bg-[#0d4a70] hover:bg-[#0c608a] text-white px-8 py-4 text-lg rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
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
                {/* Main illustration placeholder */}
                <div className="w-96 h-96 bg-gradient-to-br from-[#13d090]/20 to-[#bea1e5]/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-8 right-8 w-16 h-16 bg-[#fdce0f] rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white rounded-full"></div>
                  </div>
                  <Users className="w-32 h-32 text-[#0d4a70] opacity-80" />
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0d4a70] sm:text-4xl mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une plateforme simple et efficace pour connecter centres de formation et jurys professionnels
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-[#13d090] rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                  <Search className="h-8 w-8 text-[#13d090]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#0d4a70] mb-3">
                1. Recherchez un jury
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Filtrez par domaine de certification, région et modalités (présentiel/visio) pour trouver le jury parfait.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-[#bea1e5] rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
                <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-8 w-8 text-[#bea1e5]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#0d4a70] mb-3">
                2. Contactez directement
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Envoyez une demande structurée avec tous les détails de votre mission via notre messagerie intégrée.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-[#fdce0f] rounded-2xl rotate-2 group-hover:rotate-4 transition-transform duration-300"></div>
                <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-8 w-8 text-[#fdce0f]" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#0d4a70] mb-3">
                3. Organisez votre session
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Recevez une réponse rapide et organisez votre session de certification avec un jury qualifié.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0d4a70] sm:text-4xl mb-4">
              Pourquoi choisir SimplyJury ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une solution complète qui simplifie la mise en relation entre centres de formation et jurys professionnels
            </p>
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
              <div className="bg-white rounded-2xl shadow-xl p-8 relative z-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] rounded-full mb-6">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0d4a70] mb-6">
                    Essai gratuit
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Découvrez SimplyJury sans engagement. Testez toutes nos fonctionnalités pendant 30 jours.
                  </p>
                  <Button size="lg" className="bg-[#13d090] hover:bg-[#10b87a] text-white px-8 py-3 rounded-xl font-semibold">
                    Commencer l'essai gratuit
                  </Button>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#bea1e5] rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#fdce0f] rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-[#0d4a70] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d4a70] to-[#0a3a5a]"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Prêt à simplifier vos certifications ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Rejoignez les centres de formation qui font confiance à SimplyJury pour trouver leurs jurys qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#13d090] hover:bg-[#10b87a] text-white px-8 py-4 rounded-xl font-semibold text-lg">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#0d4a70] px-8 py-4 rounded-xl font-semibold text-lg">
              Planifier une démo
            </Button>
          </div>
        </div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#13d090] rounded-full opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#fdce0f] rounded-full opacity-10"></div>
      </section>

    </main>
  );
}
