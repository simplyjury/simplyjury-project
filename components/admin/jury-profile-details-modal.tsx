'use client';

import { useState } from 'react';
import { X, MapPin, Clock, Euro, Briefcase, Award, Calendar, Users, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface JuryProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePhotoUrl?: string;
  city?: string;
  region?: string;
  currentPosition?: string;
  currentCompany?: string;
  experienceYears?: number;
  hourlyRate?: number;
  bio?: string;
  expertiseDomains?: string[];
  certifications?: string[];
  workModalities?: string[];
  interventionZones?: string[];
  availabilityPreferences?: any[];
  createdAt?: string;
}

interface JuryProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: JuryProfile | null;
}

export function JuryProfileDetailsModal({ isOpen, onClose, profile }: JuryProfileDetailsModalProps) {
  if (!isOpen || !profile) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getModalityLabel = (modality: string) => {
    const labels: { [key: string]: string } = {
      'presentiel': 'Présentiel',
      'visio': 'Visioconférence',
      'hybride': 'Hybride'
    };
    return labels[modality] || modality;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#0d4a70] to-[#13d090]">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-white">
              <AvatarImage src={profile.profilePhotoUrl} alt={`${profile.firstName} ${profile.lastName}`} />
              <AvatarFallback className="bg-white text-[#0d4a70] text-lg font-semibold">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-blue-100">{profile.currentPosition || 'Jury professionnel'}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0d4a70] flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informations de contact
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm break-all">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{profile.city}, {profile.region}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">Inscrit le {formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0d4a70] flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Informations professionnelles
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{profile.experienceYears} ans d'expérience</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Euro className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{profile.hourlyRate}€/heure</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm">Poste actuel: {profile.currentPosition}</span>
                  </div>
                  {profile.currentCompany && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm">Entreprise: {profile.currentCompany}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#0d4a70]">Présentation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              </div>
            )}

            {/* Expertise Domains */}
            {profile.expertiseDomains && profile.expertiseDomains.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#0d4a70] flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Domaines d'expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertiseDomains.map((domain, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#0d4a70] flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="border-green-200 text-green-800">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Work Modalities */}
            {profile.workModalities && profile.workModalities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#0d4a70]">Modalités de travail</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.workModalities.map((modality, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                      {getModalityLabel(modality)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Intervention Zones */}
            {profile.interventionZones && profile.interventionZones.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#0d4a70] flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Zones d'intervention
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interventionZones.map((zone, index) => (
                    <Badge key={index} variant="outline" className="border-orange-200 text-orange-800">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Preferences */}
            {profile.availabilityPreferences && profile.availabilityPreferences.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#0d4a70] flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Préférences de disponibilité
                </h3>
                <div className="space-y-3">
                  {profile.availabilityPreferences.map((pref, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {pref.startDate && pref.endDate && 
                            `${new Date(pref.startDate).toLocaleDateString('fr-FR')} - ${new Date(pref.endDate).toLocaleDateString('fr-FR')}`
                          }
                        </span>
                        {pref.modalities && (
                          <div className="flex flex-wrap gap-1">
                            {pref.modalities.map((mod: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {getModalityLabel(mod)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {pref.note && (
                        <p className="text-sm text-gray-600">{pref.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
