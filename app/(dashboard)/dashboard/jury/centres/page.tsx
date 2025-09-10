'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Users, Video, Building, Phone, Mail, Globe, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { ContactCenterModal } from '@/components/jury/contact-center-modal';

interface TrainingCenter {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  region?: string;
  sector?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  contactPersonName?: string;
  contactPersonRole?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  isCertificateur?: boolean;
  certificationDomains?: string[];
  qualiopiCertified?: boolean;
  createdAt?: string;
  userName?: string;
  userValidationStatus?: string;
}

interface CentersResponse {
  centers: TrainingCenter[];
  count: number;
}

export default function CentersPage() {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<TrainingCenter | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const fetchCenters = async (search = '') => {
    try {
      setLoading(true);
      const url = new URL('/api/centers', window.location.origin);
      if (search.trim()) {
        url.searchParams.set('search', search);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement');
      }
      
      const data: CentersResponse = await response.json();
      setCenters(data.centers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    fetchCenters(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (centers.length > 0) {
      console.log('Frontend centers data:', centers[0]);
      console.log('First center logoUrl:', centers[0].logoUrl);
    }
  }, [centers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchCenters(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleContact = (center: TrainingCenter) => {
    setSelectedCenter(center);
    setIsContactModalOpen(true);
  };

  const handleViewProfile = (center: TrainingCenter) => {
    // TODO: Implement view profile functionality - could navigate to a detailed center profile page
    console.log('Voir le profil du centre:', center.name);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
    setSelectedCenter(null);
  };

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Status Alert */}
      <Alert className="mb-8 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Profil validé avec succès !</strong> Vous pouvez maintenant contacter les centres de formation pour proposer vos services.
        </AlertDescription>
      </Alert>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">
          Annuaire des centres de formation
        </h1>
        <p className="text-gray-600">
          Contactez directement les centres pour proposer vos services de jury professionnel
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher un centre par nom..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{centers.length}</span> centres de formation trouvés
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13d090] mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des centres...</p>
        </div>
      )}

      {/* Centers Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center) => (
            <Card key={center.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#fdce0f] to-[#fee88c] rounded-2xl flex items-center justify-center text-[#0d4a70] font-bold text-lg flex-shrink-0 overflow-hidden">
                    {(() => {
                      console.log(`Center ${center.id} (${center.name}) logoUrl:`, center.logoUrl);
                      if (center.logoUrl) {
                        return (
                          <img 
                            src={center.logoUrl} 
                            alt={`Logo ${center.name}`}
                            className="w-full h-full object-cover rounded-2xl"
                            onLoad={() => console.log(`Logo loaded successfully for ${center.name}`)}
                            onError={(e) => {
                              console.log(`Logo failed to load for ${center.name}:`, center.logoUrl);
                              // Fallback to initials if logo fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-[#0d4a70] font-bold text-lg">${getInitials(center.name)}</span>`;
                              }
                            }}
                          />
                        );
                      } else {
                        console.log(`No logo for ${center.name}, showing initials`);
                        return getInitials(center.name);
                      }
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0d4a70] text-lg mb-1 break-words leading-tight">
                      {center.name}
                    </h3>
                    {center.city && center.region && (
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {center.city}, {center.region}
                      </div>
                    )}
                    {center.qualiopiCertified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        ✅ Qualiopi
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Centre validé</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>Présentiel & Visio</span>
                  </div>
                </div>

                {/* Certification Domains */}
                {center.certificationDomains && center.certificationDomains.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Domaines de certifications
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {center.certificationDomains.slice(0, 3).map((domain, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {domain}
                        </Badge>
                      ))}
                      {center.certificationDomains.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{center.certificationDomains.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information - Only show website, no confidential contact details */}
                {center.website && (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {center.logoUrl ? (
                        <img 
                          src={center.logoUrl} 
                          alt={`Logo ${center.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if logo fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-blue-600 font-semibold">${center.name.charAt(0).toUpperCase()}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {center.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <a 
                      href={center.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#13d090] hover:underline truncate"
                    >
                      Site web
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleContact(center)}
                    className="flex-1 bg-[#13d090] hover:bg-[#0fb378] text-white"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  <Button 
                    onClick={() => handleViewProfile(center)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && centers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun centre trouvé
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? `Aucun centre ne correspond à "${searchTerm}"`
              : "Aucun centre de formation disponible pour le moment"
            }
          </p>
        </div>
      )}

      {/* Contact Modal */}
      <ContactCenterModal
        center={selectedCenter}
        isOpen={isContactModalOpen}
        onClose={handleCloseContactModal}
      />
    </div>
  );
}
