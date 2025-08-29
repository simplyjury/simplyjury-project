'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CERTIFICATION_DOMAINS = [
  'Informatique',
  'Gestion',
  'Commerce',
  'Industrie',
  'Santé',
  'Éducation',
  'Transport',
  'Hôtellerie-Restauration',
  'Bâtiment',
  'Agriculture'
];

const FRENCH_REGIONS = [
  'Auvergne-Rhône-Alpes',
  'Bourgogne-Franche-Comté',
  'Bretagne',
  'Centre-Val de Loire',
  'Corse',
  'Grand Est',
  'Hauts-de-France',
  'Île-de-France',
  'Normandie',
  'Nouvelle-Aquitaine',
  'Occitanie',
  'Pays de la Loire',
  'Provence-Alpes-Côte d\'Azur'
];

export default function CenterProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [siretLoading, setSiretLoading] = useState(false);
  const [qualiopiLoading, setQualiopiLoading] = useState(false);
  const [siretValidated, setSiretValidated] = useState(false);
  const [siretError, setSiretError] = useState('');
  const [qualiopiChecked, setQualiopiChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    siret: '',
    establishmentName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    region: '',
    sector: '',
    responsiblePerson: '',
    responsibleRole: '',
    isCertificateur: false,
    qualiopiCertified: false,
    qualiopiStatus: '',
    description: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const user = await response.json();
          setUserData(user);
          
          // Pre-populate form with user data
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            responsiblePerson: user.name || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset validation states when SIRET changes
    if (field === 'siret') {
      setSiretValidated(false);
      setSiretError('');
      setQualiopiChecked(false);
      setFormData(prev => ({
        ...prev,
        qualiopiCertified: false,
        qualiopiStatus: '',
        establishmentName: '',
        address: '',
        city: '',
        postalCode: '',
        sector: ''
      }));
    }
  };

  // Auto-complete SIRET with API Pappers
  const handleSiretAutoComplete = async (siret: string) => {
    if (!/^\d{14}$/.test(siret.replace(/\s/g, ''))) return;
    
    setSiretLoading(true);
    try {
      const response = await fetch('/api/siret/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret })
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          establishmentName: data.name || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          sector: data.sector || ''
        }));
        setSiretValidated(true);
        setSiretError('');
        
        // Check Qualiopi status
        await checkQualiopiStatus(siret);
      } else {
        setSiretError('SIRET non trouvé - Vous pouvez continuer la saisie manuellement');
        setSiretValidated(false);
      }
    } catch (error) {
      console.error('Erreur auto-complétion SIRET:', error);
      setSiretError('Erreur de vérification - Vous pouvez continuer la saisie manuellement');
    } finally {
      setSiretLoading(false);
    }
  };

  // Check Qualiopi status with API Entreprise
  const checkQualiopiStatus = async (siret: string) => {
    setQualiopiLoading(true);
    try {
      const response = await fetch(`/api/qualiopi/check?siret=${encodeURIComponent(siret)}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Qualiopi check response:', data);

        const isCertified = data.status === 'certified';
        const statusText = isCertified 
          ? `Certifié (${data.qualifications?.join(', ') || 'Formation'})` 
          : data.message || 'Non certifié';

        setFormData(prev => ({
          ...prev,
          qualiopiCertified: isCertified,
          qualiopiStatus: statusText
        }));
        setQualiopiChecked(true);
      }
    } catch (error) {
      console.error('Erreur vérification Qualiopi:', error);
      setFormData(prev => ({
        ...prev,
        qualiopiStatus: 'Vérification impossible'
      }));
      setQualiopiChecked(true);
    } finally {
      setQualiopiLoading(false);
    }
  };

  // Handle SIRET blur event
  const handleSiretBlur = () => {
    const cleanSiret = formData.siret.replace(/\s/g, '');
    if (cleanSiret.length === 14 && !siretValidated) {
      handleSiretAutoComplete(cleanSiret);
    }
  };

  const handleDomainToggle = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const removeDomain = (domain: string) => {
    setSelectedDomains(prev => prev.filter(d => d !== domain));
  };

  const validateForm = (): string | null => {
    if (!formData.siret.trim()) return 'Le SIRET est obligatoire';
    if (!formData.establishmentName.trim()) return 'Le nom de l\'établissement est obligatoire';
    if (!formData.email.trim()) return 'L\'email est obligatoire';
    if (!formData.phone.trim()) return 'Le téléphone est obligatoire';
    if (!formData.address.trim()) return 'L\'adresse est obligatoire';
    if (!formData.postalCode.trim()) return 'Le code postal est obligatoire';
    if (!formData.city.trim()) return 'La ville est obligatoire';
    if (!formData.region.trim()) return 'La région est obligatoire';
    if (!formData.responsiblePerson.trim()) return 'La personne responsable est obligatoire';
    if (!formData.responsibleRole.trim()) return 'Le rôle du responsable est obligatoire';
    if (selectedDomains.length === 0) return 'Au moins un domaine de certification est obligatoire';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'L\'adresse email n\'est pas valide';
    
    // SIRET validation (14 digits)
    if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) return 'Le SIRET doit contenir exactement 14 chiffres';
    
    // Postal code validation (5 digits)
    if (!/^\d{5}$/.test(formData.postalCode)) return 'Le code postal doit contenir exactement 5 chiffres';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom validation with French messages
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }
    
    setIsLoading(true);

    try {
      const profileData = {
        ...formData,
        certificationDomains: selectedDomains,
        qualiopiLastChecked: qualiopiChecked ? new Date() : null
      };

      const response = await fetch('/api/profile/center', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        throw new Error('Erreur lors de la création du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du profil. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0d4a70] mb-2">
            Complétez votre profil Centre de Formation
          </h1>
          <p className="text-gray-600">
            Renseignez votre SIRET pour une auto-complétion automatique des informations et la vérification Qualiopi.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#0d4a70]">Informations de l'établissement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SIRET avec auto-complétion */}
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET *</Label>
                <div className="relative">
                  <Input
                    id="siret"
                    value={formData.siret}
                    onChange={(e) => handleInputChange('siret', e.target.value)}
                    onBlur={handleSiretBlur}
                    placeholder="12345678901234"
                    maxLength={14}
                    className={siretValidated ? 'border-green-500' : ''}
                  />
                  {siretLoading && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {siretValidated && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    14 chiffres sans espaces - Auto-complétion automatique
                  </p>
                  {siretValidated && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ SIRET validé
                    </p>
                  )}
                </div>
                {siretError && (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <p className="text-sm text-orange-700 flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {siretError}
                    </p>
                  </div>
                )}
              </div>

              {/* Nom établissement */}
              <div className="space-y-2">
                <Label htmlFor="establishmentName">Nom de l'établissement *</Label>
                <Input
                  id="establishmentName"
                  value={formData.establishmentName}
                  onChange={(e) => handleInputChange('establishmentName', e.target.value)}
                  placeholder="Centre Formation Test"
                  className={siretValidated && formData.establishmentName ? 'bg-green-50' : ''}
                />
                {siretValidated && formData.establishmentName && (
                  <p className="text-sm text-green-600">
                    ✓ Complété automatiquement via SIRET
                  </p>
                )}
              </div>

              {/* Statut Qualiopi */}
              {qualiopiChecked && (
                <Alert className={formData.qualiopiCertified ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
                  <div className="flex items-center gap-2">
                    {qualiopiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : formData.qualiopiCertified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        Certification Qualiopi : {formData.qualiopiStatus}
                      </p>
                      <AlertDescription className="mt-1">
                        {formData.qualiopiCertified 
                          ? "Votre organisme possède la certification Qualiopi."
                          : "Votre organisme ne possède pas la certification Qualiopi ou elle n'est pas détectée."}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Contact référent */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0d4a70]">Contact référent</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@centre-test.fr"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {userData?.email === formData.email ? 
                        "Utilise votre email de connexion" : 
                        "Email professionnel pour les contacts jurys"
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Secteur d'activité */}
              {formData.sector && (
                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur d'activité</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    placeholder="Secteur d'activité"
                    className="bg-green-50"
                    readOnly
                  />
                  <p className="text-sm text-green-600">
                    ✓ Complété automatiquement via SIRET
                  </p>
                </div>
              )}

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Rue de la Formation"
                  className={siretValidated && formData.address ? 'bg-green-50' : ''}
                />
                {siretValidated && formData.address && (
                  <p className="text-sm text-green-600">
                    ✓ Complété automatiquement via SIRET
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="75001"
                    maxLength={5}
                    className={siretValidated && formData.postalCode ? 'bg-green-50' : ''}
                  />
                  {siretValidated && formData.postalCode && (
                    <p className="text-sm text-green-600">✓ Auto-complété</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Paris"
                    className={siretValidated && formData.city ? 'bg-green-50' : ''}
                  />
                  {siretValidated && formData.city && (
                    <p className="text-sm text-green-600">✓ Auto-complété</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <Select onValueChange={(value: string) => handleInputChange('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {FRENCH_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Responsable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsiblePerson">Personne responsable *</Label>
                  <Input
                    id="responsiblePerson"
                    value={formData.responsiblePerson}
                    onChange={(e) => handleInputChange('responsiblePerson', e.target.value)}
                    placeholder="Marie Martin"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {userData?.name === formData.responsiblePerson ? 
                      "Utilise votre nom de connexion" : 
                      "Nom du responsable pédagogique"
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibleRole">Rôle du responsable *</Label>
                  <Input
                    id="responsibleRole"
                    value={formData.responsibleRole}
                    onChange={(e) => handleInputChange('responsibleRole', e.target.value)}
                    placeholder="Directrice pédagogique"
                  />
                </div>
              </div>

              {/* Domaines de certification */}
              <div className="space-y-2">
                <Label>Domaines de certification *</Label>
                <Select onValueChange={handleDomainToggle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un domaine" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATION_DOMAINS.filter(domain => !selectedDomains.includes(domain)).map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDomains.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedDomains.map((domain) => (
                      <Badge key={domain} variant="secondary" className="bg-[#e8faf5] text-[#0d4a70]">
                        {domain}
                        <button
                          type="button"
                          onClick={() => removeDomain(domain)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Centre certificateur */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCertificateur"
                  checked={formData.isCertificateur}
                  onCheckedChange={(checked: boolean) => handleInputChange('isCertificateur', checked)}
                />
                <Label htmlFor="isCertificateur" className="text-sm">
                  Notre centre est certificateur (habilité à délivrer des certifications)
                </Label>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description de l'établissement (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez brièvement votre établissement, vos spécialités..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || selectedDomains.length === 0}
                  className="bg-[#13d090] hover:bg-[#0ea472] text-white"
                >
                  {isLoading ? 'Création...' : 'Créer mon profil'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
