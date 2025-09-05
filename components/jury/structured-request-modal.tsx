'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Video, Users, Calendar, Clock, Mail, Send } from 'lucide-react';

interface JuryProfile {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  rating?: number;
  expertiseDomains: string[];
  city?: string;
  region?: string;
}

interface StructuredRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  jury: JuryProfile;
  onSubmit: (requestData: StructuredRequestData) => Promise<void>;
}

interface StructuredRequestData {
  juryId: number;
  certificationType: string;
  sessionDate: string;
  candidateCount: number;
  startTime: string;
  endTime: string;
  modality: 'presentiel' | 'visio' | 'hybride';
  location?: string;
  transportCovered: boolean;
  mealsCovered: boolean;
  accommodationCovered: boolean;
  customMessage: string;
}

const certificationOptions = [
  { value: 'RNCP31114', label: 'Développeur Web et Web Mobile (RNCP31114)' },
  { value: 'RNCP34838', label: 'Concepteur Développeur d\'Applications (RNCP34838)' },
  { value: 'RNCP36061', label: 'Expert en Technologies de l\'Information (RNCP36061)' },
  { value: 'RNCP35475', label: 'Administrateur d\'infrastructures sécurisées (RNCP35475)' },
  { value: 'autre', label: 'Autre certification' }
];

export default function StructuredRequestModal({ 
  isOpen, 
  onClose, 
  jury, 
  onSubmit 
}: StructuredRequestModalProps) {
  const [formData, setFormData] = useState<StructuredRequestData>({
    juryId: jury.id,
    certificationType: '',
    sessionDate: '',
    candidateCount: 1,
    startTime: '09:00',
    endTime: '17:00',
    modality: 'presentiel',
    location: '',
    transportCovered: false,
    mealsCovered: false,
    accommodationCovered: false,
    customMessage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [charCount, setCharCount] = useState(0);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, juryId: jury.id }));
      setErrors({});
      setCharCount(0);
    }
  }, [isOpen, jury.id]);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (field: keyof StructuredRequestData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMessageChange = (value: string) => {
    if (value.length <= 1000) {
      setFormData(prev => ({ ...prev, customMessage: value }));
      setCharCount(value.length);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.certificationType) {
      newErrors.certificationType = 'Veuillez sélectionner une certification';
    }
    if (!formData.sessionDate) {
      newErrors.sessionDate = 'Veuillez sélectionner une date';
    }
    if (formData.candidateCount < 1 || formData.candidateCount > 50) {
      newErrors.candidateCount = 'Le nombre de candidats doit être entre 1 et 50';
    }
    if ((formData.modality === 'presentiel' || formData.modality === 'hybride') && !formData.location) {
      newErrors.location = 'Veuillez préciser le lieu de la session';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalitySelect = (modality: 'presentiel' | 'visio' | 'hybride') => {
    setFormData(prev => ({ ...prev, modality }));
    // Clear location if switching to visio
    if (modality === 'visio') {
      setFormData(prev => ({ ...prev, location: '' }));
    }
  };

  if (!isOpen) return null;

  const getJuryInitials = () => {
    return `${jury.firstName.charAt(0)}${jury.lastName.charAt(0)}`.toUpperCase();
  };

  const getCharCountClass = () => {
    if (charCount > 950) return 'text-red-500';
    if (charCount > 800) return 'text-amber-500';
    return 'text-slate-400';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0d4a70] to-[#1a5a8a] text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full transform translate-x-24 -translate-y-24"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Demande de jury externe</h2>
              <p className="text-white/90 mb-5">Remplissez les détails de votre session d'examen</p>
              
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {getJuryInitials()}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{jury.firstName} {jury.lastName}</h4>
                  <div className="flex items-center gap-1 text-white/90">
                    <Star className="w-4 h-4 fill-current" />
                    <span>4.9 • {jury.expertiseDomains[0] || 'Expert'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-11 h-11 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Freemium Notice */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-[#0d4a70] p-4 mx-8 mt-6 rounded-xl flex items-center gap-3 font-semibold shadow-lg">
          <Star className="w-6 h-6" />
          Il s'agit de votre mise en relation gratuite. Passez au plan Pro pour des contacts illimités.
        </div>

        {/* Form Content */}
        <div className="max-h-[calc(90vh-280px)] overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Certification et Session */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-[#13d090]" />
                <h3 className="text-xl font-bold text-[#0d4a70]">Certification et session d'examen</h3>
              </div>
              <p className="text-slate-600 mb-6">Précisez la certification visée et les détails de votre session d'examen.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                    Certification visée <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.certificationType}
                    onChange={(e) => handleInputChange('certificationType', e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-medium transition-all ${
                      errors.certificationType ? 'border-red-500' : 'border-slate-200 focus:border-[#13d090]'
                    } focus:outline-none focus:ring-3 focus:ring-[#13d090]/10`}
                  >
                    <option value="">Sélectionnez une certification</option>
                    {certificationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.certificationType && (
                    <p className="text-red-500 text-sm mt-1">{errors.certificationType}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                      Date de la session <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={formData.sessionDate}
                      onChange={(e) => handleInputChange('sessionDate', e.target.value)}
                      className={`w-full p-4 border-2 rounded-xl transition-all ${
                        errors.sessionDate ? 'border-red-500' : 'border-slate-200 focus:border-[#13d090]'
                      } focus:outline-none focus:ring-3 focus:ring-[#13d090]/10`}
                    />
                    {errors.sessionDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.sessionDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                      Nombre de candidats <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.candidateCount}
                      onChange={(e) => handleInputChange('candidateCount', parseInt(e.target.value))}
                      placeholder="Ex: 8"
                      className={`w-full p-4 border-2 rounded-xl transition-all ${
                        errors.candidateCount ? 'border-red-500' : 'border-slate-200 focus:border-[#13d090]'
                      } focus:outline-none focus:ring-3 focus:ring-[#13d090]/10`}
                    />
                    {errors.candidateCount && (
                      <p className="text-red-500 text-sm mt-1">{errors.candidateCount}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0d4a70] mb-3">Créneaux horaires</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Heure de début</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-[#13d090] focus:outline-none focus:ring-3 focus:ring-[#13d090]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Heure de fin</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-[#13d090] focus:outline-none focus:ring-3 focus:ring-[#13d090]/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Modalités et Logistique */}
            <div className="border-b border-slate-200 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-[#13d090]" />
                <h3 className="text-xl font-bold text-[#0d4a70]">Modalités et logistique</h3>
              </div>
              <p className="text-slate-600 mb-6">Choisissez la modalité d'examen et précisez les conditions logistiques.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0d4a70] mb-3">
                    Modalité d'examen <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'presentiel', icon: Users, title: 'Présentiel', desc: 'Dans nos locaux' },
                      { key: 'visio', icon: Video, title: 'Visioconférence', desc: 'À distance' },
                      { key: 'hybride', icon: Calendar, title: 'Hybride', desc: 'Mixte' }
                    ].map(({ key, icon: Icon, title, desc }) => (
                      <div
                        key={key}
                        onClick={() => handleModalitySelect(key as any)}
                        className={`p-5 border-2 rounded-xl cursor-pointer transition-all text-center ${
                          formData.modality === key
                            ? 'border-[#13d090] bg-[#13d090]/10 shadow-lg shadow-[#13d090]/15'
                            : 'border-slate-200 hover:border-[#13d090] hover:bg-[#13d090]/5'
                        }`}
                      >
                        <Icon className="w-8 h-8 text-[#13d090] mx-auto mb-3" />
                        <h4 className="font-semibold text-[#0d4a70] mb-1">{title}</h4>
                        <p className="text-sm text-slate-600">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {(formData.modality === 'presentiel' || formData.modality === 'hybride') && (
                  <div>
                    <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                      Lieu de la session <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Adresse complète du lieu d'examen"
                      className={`w-full p-4 border-2 rounded-xl transition-all ${
                        errors.location ? 'border-red-500' : 'border-slate-200 focus:border-[#13d090]'
                      } focus:outline-none focus:ring-3 focus:ring-[#13d090]/10`}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#0d4a70] mb-3">Frais pris en charge</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'transportCovered', label: 'Transport', desc: 'Frais de déplacement' },
                      { key: 'mealsCovered', label: 'Restauration', desc: 'Déjeuner inclus' },
                      { key: 'accommodationCovered', label: 'Hébergement', desc: 'Si session de plusieurs jours' }
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-[#13d090] hover:bg-[#13d090]/2 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          id={key}
                          checked={formData[key as keyof StructuredRequestData] as boolean}
                          onChange={(e) => handleInputChange(key as keyof StructuredRequestData, e.target.checked)}
                          className="w-5 h-5 text-[#13d090] rounded focus:ring-[#13d090] focus:ring-2"
                        />
                        <div>
                          <label htmlFor={key} className="font-semibold text-[#0d4a70] cursor-pointer">{label}</label>
                          <p className="text-sm text-slate-600">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Message */}
            <div className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-[#13d090]" />
                <h3 className="text-xl font-bold text-[#0d4a70]">Message personnalisé</h3>
                <div className="group relative">
                  <div className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-xs text-white cursor-help">?</div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0d4a70] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Message optionnel pour contextualiser votre demande
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  value={formData.customMessage}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder={`Bonjour ${jury.firstName},

J'espère que vous allez bien. Nous organisons une session d'examen et aimerions faire appel à votre expertise.

Pouvez-vous nous confirmer votre disponibilité ?

Cordialement,
[Votre nom]`}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-[#13d090] focus:outline-none focus:ring-3 focus:ring-[#13d090]/10 transition-all resize-none h-40 leading-relaxed"
                  maxLength={1000}
                />
                <div className={`text-right text-sm mt-2 ${getCharCountClass()}`}>
                  {charCount}/1000 caractères
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-8 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="demandForm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-7 py-3 bg-[#13d090] text-white rounded-xl font-semibold hover:bg-[#0fb378] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#13d090]/30 hover:shadow-xl hover:shadow-[#13d090]/40 hover:-translate-y-0.5 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer la demande
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
