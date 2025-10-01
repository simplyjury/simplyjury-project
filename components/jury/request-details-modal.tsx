'use client';

import React from 'react';
import { X, Calendar, Users, MapPin, Clock, Building, Mail, Phone, FileText, CheckCircle, XCircle } from 'lucide-react';

interface JuryRequest {
  id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  certification_title: string;
  certification_code?: string;
  session_date: string;
  session_start_time?: string;
  session_end_time?: string;
  candidate_count: number;
  modality: 'presentiel' | 'visio' | 'hybride';
  session_location?: string;
  transport_covered: boolean;
  meals_covered: boolean;
  accommodation_covered: boolean;
  custom_message?: string;
  created_at: string;
  training_centers: {
    name: string;
    contact_person_name: string;
    contact_person_email: string;
  };
}

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: JuryRequest;
  onAccept?: (requestId: number) => Promise<void>;
  onDecline?: (requestId: number) => Promise<void>;
}

export default function RequestDetailsModal({ 
  isOpen, 
  onClose, 
  request,
  onAccept,
  onDecline
}: RequestDetailsModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" />
            En attente de votre réponse
          </div>
        );
      case 'accepted':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Acceptée
          </div>
        );
      case 'rejected':
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            Refusée
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
            {status}
          </div>
        );
    }
  };

  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'presentiel':
        return 'Présentiel';
      case 'visio':
        return 'Visioconférence';
      case 'hybride':
        return 'Hybride';
      default:
        return modality;
    }
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'presentiel':
        return <Building className="w-5 h-5" />;
      case 'visio':
        return <Users className="w-5 h-5" />;
      case 'hybride':
        return <MapPin className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0d4a70] to-[#1a5a8a] text-white p-8 relative overflow-hidden rounded-t-3xl flex-shrink-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full transform translate-x-24 -translate-y-24"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Demande de jury externe</h2>
              <p className="text-white/90 mb-4">Détails de la mission proposée</p>
              {getStatusBadge(request.status)}
            </div>
            
            <button
              onClick={onClose}
              className="w-11 h-11 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            {/* Training Center Info */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-6 h-6 text-[#13d090]" />
                <h3 className="text-xl font-bold text-[#0d4a70]">Centre de formation</h3>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-[#0d4a70] mb-3">{request.training_centers.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Contact</div>
                      <div className="font-medium">{request.training_centers.contact_person_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{request.training_centers.contact_person_email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certification Details */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-[#13d090]" />
                <h3 className="text-xl font-bold text-[#0d4a70]">Certification et session</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-1">Certification visée</div>
                  <div className="font-semibold text-[#0d4a70] text-lg">{request.certification_title}</div>
                  {request.certification_code && (
                    <div className="text-sm text-gray-500 mt-1">Code: {request.certification_code}</div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-sm text-gray-600 mb-1">Date de session</div>
                  <div className="font-semibold text-[#0d4a70] flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {formatDate(request.session_date)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-[#13d090] mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Candidats</div>
                  <div className="font-bold text-[#0d4a70] text-lg">{request.candidate_count}</div>
                </div>
                
                {request.session_start_time && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-[#13d090] mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Début</div>
                    <div className="font-bold text-[#0d4a70] text-lg">{formatTime(request.session_start_time)}</div>
                  </div>
                )}
                
                {request.session_end_time && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-[#13d090] mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Fin</div>
                    <div className="font-bold text-[#0d4a70] text-lg">{formatTime(request.session_end_time)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Modality and Location */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-[#13d090]" />
                <h3 className="text-xl font-bold text-[#0d4a70]">Modalités</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {getModalityIcon(request.modality)}
                    <div className="text-sm text-gray-600">Modalité d'examen</div>
                  </div>
                  <div className="font-semibold text-[#0d4a70] text-lg">{getModalityText(request.modality)}</div>
                </div>
                
                {request.session_location && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div className="text-sm text-gray-600">Lieu de session</div>
                    </div>
                    <div className="font-semibold text-[#0d4a70]">{request.session_location}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-[#0d4a70] mb-4">Frais pris en charge</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border-2 ${request.transport_covered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${request.transport_covered ? 'bg-green-500' : 'bg-gray-400'}`}>
                      {request.transport_covered ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0d4a70]">Transport</div>
                      <div className="text-sm text-gray-600">Frais de déplacement</div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 ${request.meals_covered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${request.meals_covered ? 'bg-green-500' : 'bg-gray-400'}`}>
                      {request.meals_covered ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0d4a70]">Restauration</div>
                      <div className="text-sm text-gray-600">Déjeuner inclus</div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl border-2 ${request.accommodation_covered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${request.accommodation_covered ? 'bg-green-500' : 'bg-gray-400'}`}>
                      {request.accommodation_covered ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0d4a70]">Hébergement</div>
                      <div className="text-sm text-gray-600">Si nécessaire</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            {request.custom_message && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-bold text-[#0d4a70] mb-4">Message du centre</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
                  <div className="text-gray-700 whitespace-pre-wrap">{request.custom_message}</div>
                </div>
              </div>
            )}

            {/* Request Info */}
            <div>
              <h3 className="text-xl font-bold text-[#0d4a70] mb-4">Informations de la demande</h3>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-sm text-gray-600">Demande reçue le</div>
                <div className="font-semibold text-[#0d4a70]">{formatDate(request.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {request.status === 'pending' && (onAccept || onDecline) && (
          <div className="flex justify-between items-center p-8 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-300 transition-all"
            >
              Fermer
            </button>
            <div className="flex gap-3">
              {onDecline && (
                <button
                  onClick={() => onDecline(request.id)}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Refuser
                </button>
              )}
              {onAccept && (
                <button
                  onClick={() => onAccept(request.id)}
                  className="px-6 py-3 bg-[#13d090] text-white rounded-xl font-semibold hover:bg-[#0fb378] transition-all shadow-lg shadow-[#13d090]/30 hover:shadow-xl hover:shadow-[#13d090]/40 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Accepter
                </button>
              )}
            </div>
          </div>
        )}
        
        {request.status !== 'pending' && (
          <div className="flex justify-center items-center p-8 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-[#0d4a70] text-white rounded-xl font-semibold hover:bg-[#0a3a5a] transition-all"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
