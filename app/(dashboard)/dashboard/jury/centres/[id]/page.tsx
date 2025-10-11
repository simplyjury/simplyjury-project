'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Building, Globe, CheckCircle, ArrowLeft, Calendar, Award, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrainingCenter {
  id: number;
  name: string;
  siret: string;
  address?: string;
  city?: string;
  postalCode?: string;
  region?: string;
  isCertificateur?: boolean;
  certificationDomains?: string[];
  qualiopiCertified?: boolean;
  qualiopiStatus?: string;
  sector?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  createdAt?: string;
  userValidationStatus?: string;
}

interface Certification {
  id: number;
  fcCertificationId: string;
  title: string;
  code: string;
  level?: string;
  domain?: string;
  status?: string;
  validityStart?: string;
  validityEnd?: string;
  approvalStatus?: string;
}

export default function CenterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [center, setCenter] = useState<TrainingCenter | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenterDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/centers/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Centre non trouvé');
          } else if (response.status === 403) {
            throw new Error('Accès non autorisé');
          } else {
            throw new Error('Erreur lors du chargement des détails');
          }
        }
        
        const data = await response.json();
        setCenter(data.center);
        setCertifications(data.certifications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCenterDetails();
    }
  }, [params.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13d090] mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Centre non trouvé'}</AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push('/dashboard/jury/centres')}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'annuaire
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Back Button */}
      <Button
        onClick={() => router.push('/dashboard/jury/centres')}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à l'annuaire
      </Button>

      {/* Header Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-[#fdce0f] to-[#fee88c] rounded-2xl flex items-center justify-center text-[#0d4a70] font-bold text-2xl flex-shrink-0 overflow-hidden">
              {center.logoUrl ? (
                <img 
                  src={center.logoUrl} 
                  alt={`Logo ${center.name}`}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-[#0d4a70] font-bold text-2xl">${getInitials(center.name)}</span>`;
                    }
                  }}
                />
              ) : (
                getInitials(center.name)
              )}
            </div>

            {/* Center Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 className="text-3xl font-bold text-[#0d4a70]">
                  {center.name}
                </h1>
                {center.qualiopiCertified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Qualiopi
                  </Badge>
                )}
                {center.isCertificateur && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Award className="h-4 w-4 mr-1" />
                    Certificateur
                  </Badge>
                )}
              </div>

              {/* Location */}
              {(center.city || center.region) && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {center.address && `${center.address}, `}
                    {center.postalCode && `${center.postalCode} `}
                    {center.city}
                    {center.region && `, ${center.region}`}
                  </span>
                </div>
              )}

              {/* Website */}
              {center.website && (
                <div className="flex items-center mb-2">
                  <Globe className="h-5 w-5 mr-2 text-gray-600" />
                  <a 
                    href={center.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#13d090] hover:underline"
                  >
                    {center.website}
                  </a>
                </div>
              )}

              {/* SIRET */}
              <div className="flex items-center text-gray-600 mb-2">
                <Building className="h-5 w-5 mr-2" />
                <span>SIRET: {center.siret}</span>
              </div>

              {/* Sector */}
              {center.sector && (
                <div className="mt-3">
                  <Badge variant="outline">{center.sector}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {center.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-[#0d4a70]">À propos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{center.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Certification Domains */}
      {center.certificationDomains && center.certificationDomains.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-[#0d4a70]">Domaines de certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {center.certificationDomains.map((domain, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {domain}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RNCP Certifications - Only show if center is certificateur */}
      {center.isCertificateur && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-[#0d4a70] flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" />
              Certifications RNCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certifications.length > 0 ? (
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div 
                    key={cert.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#13d090] transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#0d4a70] mb-2">
                          {cert.title}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          {cert.code && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Code:</span>
                              <Badge variant="secondary">{cert.code}</Badge>
                            </div>
                          )}
                          {cert.level && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Niveau:</span>
                              <span>{cert.level}</span>
                            </div>
                          )}
                          {cert.domain && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Domaine:</span>
                              <span>{cert.domain}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {cert.status && (
                          <Badge 
                            variant={cert.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className={cert.status === 'ACTIVE' ? 'bg-green-600' : ''}
                          >
                            {cert.status}
                          </Badge>
                        )}
                        {(cert.validityStart || cert.validityEnd) && (
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {cert.validityStart && formatDate(cert.validityStart)}
                                {cert.validityEnd && ` - ${formatDate(cert.validityEnd)}`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucune certification RNCP attachée pour le moment
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#0d4a70]">Informations complémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Statut Qualiopi:</span>
              <span className="ml-2 text-gray-600">
                {center.qualiopiCertified ? (
                  <span className="text-green-600 font-medium">✓ Certifié</span>
                ) : (
                  'Non certifié'
                )}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type de centre:</span>
              <span className="ml-2 text-gray-600">
                {center.isCertificateur ? 'Organisme certificateur' : 'Centre de formation'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Membre depuis:</span>
              <span className="ml-2 text-gray-600">
                {formatDate(center.createdAt)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Statut du profil:</span>
              <span className="ml-2 text-gray-600">
                {center.userValidationStatus === 'validated' && (
                  <span className="text-green-600 font-medium">✓ Validé</span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Note */}
      <Alert className="mt-6 border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-800">
          <strong>Note:</strong> Pour contacter ce centre et proposer vos services, 
          retournez à l'annuaire et utilisez le bouton "Contacter".
        </AlertDescription>
      </Alert>
    </div>
  );
}
