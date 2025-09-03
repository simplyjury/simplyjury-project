'use client';

import { AlertTriangle, Star, Flag, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';

export default function ModerationAvisPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Modération avis</h1>
        <p className="text-gray-600">Gérez les avis et signalements sur la plateforme</p>
      </div>

      {/* Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">3 avis signalés nécessitent votre attention</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Avis signalés</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">156</div>
          <div className="text-sm text-gray-600">Avis validés</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">12</div>
          <div className="text-sm text-gray-600">Avis supprimés</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">4.7</div>
          <div className="text-sm text-gray-600">Note moyenne</div>
        </div>
      </div>

      {/* Reported Reviews */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Avis signalés</h3>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 1 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">par Jean Martin</span>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Signalé</span>
                </div>
                <p className="text-gray-700 mb-3">
                  "Service absolument décevant, jury incompétent et non professionnel. À éviter absolument !"
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600">
                    <strong>Motif du signalement :</strong> Contenu inapproprié, langage offensant
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Signalé par :</strong> Marie Dubois (Jury concerné)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                    <CheckCircle className="w-4 h-4" />
                    Valider l'avis
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                    <XCircle className="w-4 h-4" />
                    Supprimer l'avis
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                    <MessageSquare className="w-4 h-4" />
                    Contacter l'auteur
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Flag className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 2 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">par Sophie Durand</span>
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">En cours</span>
                </div>
                <p className="text-gray-700 mb-3">
                  "Le jury n'était pas préparé et a posé des questions hors sujet. Très déçue de cette expérience."
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600">
                    <strong>Motif du signalement :</strong> Informations potentiellement fausses
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Signalé par :</strong> Centre Formation Excellence
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                    <CheckCircle className="w-4 h-4" />
                    Valider l'avis
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200">
                    <XCircle className="w-4 h-4" />
                    Supprimer l'avis
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                    <Eye className="w-4 h-4" />
                    Enquête approfondie
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0d4a70]">Avis récents</h3>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                AL
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">par Alice Leroy</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Validé</span>
                </div>
                <p className="text-gray-700 mb-2">
                  "Excellent jury, très professionnel et bienveillant. Questions pertinentes et feedback constructif."
                </p>
                <div className="text-sm text-gray-500">Il y a 2h</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                PM
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">par Pierre Moreau</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Validé</span>
                </div>
                <p className="text-gray-700 mb-2">
                  "Bonne expérience globale. Le jury était compétent, quelques points d'amélioration possibles."
                </p>
                <div className="text-sm text-gray-500">Il y a 5h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
