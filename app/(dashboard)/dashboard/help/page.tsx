'use client';

import { HelpCircle, Search, BookOpen, MessageSquare, Phone, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Aide & Support</h1>
        <p className="text-gray-600">Trouvez de l'aide et contactez notre équipe</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-[#0d4a70] rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">
            Centre d'aide en cours de développement
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cette section centralisera toutes les ressources d'aide, la documentation 
            et les moyens de contact pour vous accompagner dans l'utilisation de SimplyJury.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-[#0d4a70] mb-2">Fonctionnalités à venir :</h3>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Base de connaissances complète</li>
              <li>• Guides d'utilisation pas à pas</li>
              <li>• FAQ interactive</li>
              <li>• Formulaire de contact support</li>
              <li>• Chat en direct avec l'équipe</li>
              <li>• Tutoriels vidéo</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Documentation</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <span>Chat support</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Mail className="w-4 h-4 text-purple-500" />
              <span>Email</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Cette page sera bientôt disponible dans une prochaine mise à jour.
          </div>
        </div>
      </div>
    </section>
  );
}
