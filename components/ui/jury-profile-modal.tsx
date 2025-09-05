'use client';

import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { MapPin, X, User, Search, Video, Calendar, Mail, Bookmark, Users } from 'lucide-react';

interface JuryProfile {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  expertiseDomains: string[];
  workModalities: string[];
  interventionZones: string[];
  bio: string;
  currentPosition: string;
  experienceYears: number;
  hourlyRate: number;
  availabilityPreferences?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    modalities: string[];
    note?: string;
  }>;
  profilePhotoUrl?: string;
  email?: string;
  phone?: string;
  availabilityDetails?: string;
  certifications?: string[];
  languages?: string[];
  education?: string;
  previousExperiences?: string[];
  company?: string;
}

interface JuryProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  jury: JuryProfile | null;
  onContact?: (juryId: number) => void;
}

export function JuryProfileModal({ isOpen, onClose, jury, onContact }: JuryProfileModalProps) {
  if (!jury) return null;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-3">
        <span className="text-[#fdce0f] text-xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {'★'.repeat(fullStars)}
          {hasHalfStar && '☆'}
          {'☆'.repeat(emptyStars)}
        </span>
        <span className="text-white text-base font-semibold opacity-90">
          {rating} ({jury.reviewCount} avis)
        </span>
      </div>
    );
  };

  const handleContact = () => {
    if (onContact) {
      onContact(jury.id);
    }
    // Don't close modal immediately, let the parent handle it
  };

  const handleSave = () => {
    // Handle save to favorites
    alert('Jury sauvegardé dans vos favoris !');
  };

  // Custom DialogContent without the default close button
  const CustomDialogContent = ({ className, children, ...props }: any) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        {/* No default close button here */}
      </DialogPrimitive.Content>
    </DialogPortal>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <CustomDialogContent className="max-w-[900px] max-h-[90vh] p-0 overflow-hidden rounded-[20px]">
        {/* Modal Header with Gradient */}
        <div 
          className="relative px-8 py-8 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d4a70 0%, #1a5a8a 100%)'
          }}
        >
          {/* Decorative gradient circle */}
          <div 
            className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full opacity-10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
              transform: 'translate(50%, -50%)'
            }}
          />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-5 flex-1">
              {/* Large Avatar */}
              <div className="flex-shrink-0">
                {jury.profilePhotoUrl ? (
                  <img 
                    src={jury.profilePhotoUrl} 
                    alt={jury.name}
                    className="w-20 h-20 rounded-[20px] object-cover"
                    style={{ boxShadow: '0 8px 25px rgba(190, 161, 229, 0.4)' }}
                  />
                ) : (
                  <div 
                    className="w-20 h-20 rounded-[20px] flex items-center justify-center text-[28px] font-bold text-white"
                    style={{ 
                      background: 'linear-gradient(135deg, #bea1e5, #cfbaed)',
                      boxShadow: '0 8px 25px rgba(190, 161, 229, 0.4)'
                    }}
                  >
                    {jury.avatar}
                  </div>
                )}
              </div>
              
              {/* Header Text */}
              <div className="flex-1">
                <h1 className="text-[28px] font-bold mb-2">{jury.name}</h1>
                <div className="flex items-center gap-2 text-base opacity-90 mb-3">
                  <MapPin className="w-4 h-4" />
                  {jury.location}
                </div>
                {renderStars(jury.rating)}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{ background: 'rgba(255, 255, 255, 0.15)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Professional Summary Section */}
          <div className="px-8 py-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0d4a70] mb-5 flex items-center gap-3">
              <User className="w-6 h-6 text-[#13d090]" />
              Profil professionnel
            </h2>
            
            <div 
              className="rounded-2xl p-6 border border-gray-200"
              style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Poste actuel</span>
                  <span className="text-base font-semibold text-[#0d4a70]">
                    {jury.currentPosition || 'Développeur Senior Full-Stack'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Entreprise</span>
                  <span className="text-base font-semibold text-[#0d4a70]">
                    {jury.company || 'TechSolutions SARL'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Expérience</span>
                  <span className="text-base font-semibold text-[#0d4a70]">
                    {jury.experienceYears ? `${jury.experienceYears} ans` : '8-15 ans'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Formation</span>
                  <span className="text-base font-semibold text-[#0d4a70]">
                    {jury.education || 'Master Informatique - EPITA'}
                  </span>
                </div>
              </div>
              
              {jury.bio && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 leading-relaxed text-[15px]">{jury.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Expertise Section */}
          <div className="px-8 py-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0d4a70] mb-5 flex items-center gap-3">
              <Search className="w-6 h-6 text-[#13d090]" />
              Domaines d'expertise
            </h2>
            
            <div className="flex flex-wrap gap-2.5">
              {jury.expertiseDomains?.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0d4a70] border transition-all duration-200 hover:-translate-y-0.5"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(19,208,144,0.1), rgba(19,208,144,0.05))',
                    borderColor: 'rgba(19,208,144,0.2)',
                    boxShadow: '0 0 0 0 rgba(19,208,144,0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(19,208,144,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(19,208,144,0.15)';
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Modalities Section */}
          <div className="px-8 py-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0d4a70] mb-5 flex items-center gap-3">
              <Video className="w-6 h-6 text-[#13d090]" />
              Modalités acceptées
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jury.workModalities?.includes('visio') && (
                <div className="bg-white border-2 rounded-xl p-5 text-center transition-all duration-200"
                     style={{ borderColor: 'rgba(19,208,144,0.3)', background: 'rgba(19,208,144,0.05)' }}>
                  <Video className="w-8 h-8 text-[#13d090] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#0d4a70] mb-1">Visioconférence</h3>
                  <p className="text-sm text-gray-600">Préférée - Très bien équipé</p>
                </div>
              )}
              
              {jury.workModalities?.includes('presentiel') ? (
                <div className="bg-white border-2 rounded-xl p-5 text-center transition-all duration-200"
                     style={{ borderColor: 'rgba(19,208,144,0.3)', background: 'rgba(19,208,144,0.05)' }}>
                  <Users className="w-8 h-8 text-[#13d090] mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-[#0d4a70] mb-1">Présentiel</h3>
                  <p className="text-sm text-gray-600">Disponible sur demande</p>
                </div>
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-400 mb-1">Présentiel</h3>
                  <p className="text-sm text-gray-400">Non disponible actuellement</p>
                </div>
              )}
            </div>
          </div>

          {/* Zone d'intervention */}
          <div className="px-8 py-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0d4a70] mb-5 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[#13d090]" />
              Zone d'intervention
            </h2>
            
            <div className="flex gap-3 flex-wrap">
              {jury.interventionZones?.length ? (
                jury.interventionZones.map((zone: string, index: number) => (
                  <span 
                    key={index}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0d4a70] border"
                    style={{ 
                      background: 'rgba(253,206,15,0.1)',
                      borderColor: 'rgba(253,206,15,0.3)'
                    }}
                  >
                    {zone}
                  </span>
                ))
              ) : (
                <span 
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#0d4a70] border"
                  style={{ 
                    background: 'rgba(253,206,15,0.1)',
                    borderColor: 'rgba(253,206,15,0.3)'
                  }}
                >
                  National (Visio)
                </span>
              )}
            </div>
          </div>

          {/* Availability Section */}
          <div className="px-8 py-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-[#0d4a70] mb-5 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-[#13d090]" />
              Disponibilités
            </h2>
            
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-[#0d4a70]">Créneaux disponibles</h3>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                     style={{ 
                       background: 'rgba(19,208,144,0.1)',
                       border: '1px solid rgba(19,208,144,0.2)',
                       color: '#0d7a5a'
                     }}>
                  <div className="w-2 h-2 rounded-full bg-[#13d090]" />
                  Disponible immédiatement
                </div>
              </div>
              
              <div className="space-y-3">
                {(() => {
                  // Filter availability preferences to show only future dates
                  const now = new Date();
                  const futureAvailabilities = jury.availabilityPreferences?.filter((pref: any) => {
                    const endDate = new Date(pref.endDate);
                    return endDate > now;
                  }) || [];

                  if (futureAvailabilities.length === 0) {
                    return (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
                        <div className="text-gray-500">Aucune disponibilité future renseignée</div>
                      </div>
                    );
                  }

                  return futureAvailabilities.map((availability: any, index: number) => {
                    const startDate = new Date(availability.startDate);
                    const endDate = new Date(availability.endDate);
                    const formatDate = (date: Date) => {
                      return date.toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      });
                    };

                    return (
                      <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 transition-all duration-200 hover:shadow-md">
                        <div className="text-base font-semibold text-[#0d4a70] mb-2">
                          {formatDate(startDate)} - {formatDate(endDate)}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          {availability.modalities?.includes('visio') && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Video className="w-4 h-4" />
                              Visioconférence
                            </div>
                          )}
                          {availability.modalities?.includes('presentiel') && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              Présentiel
                            </div>
                          )}
                        </div>
                        {availability.note && (
                          <div className="text-sm text-gray-500 italic mt-2">
                            {availability.note}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
