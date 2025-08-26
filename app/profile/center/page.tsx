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
import { X } from 'lucide-react';

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
  
  const [formData, setFormData] = useState({
    siret: '',
    establishmentName: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    region: '',
    responsiblePerson: '',
    responsibleRole: '',
    isCertificateur: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData = {
        ...formData,
        certificationDomains: selectedDomains
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
      // TODO: Add proper error handling with toast
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
            Ces informations nous permettront de mieux vous accompagner dans vos recherches de jurys.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#0d4a70]">Informations de l'établissement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SIRET */}
              <div>
                <Label htmlFor="siret">SIRET *</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => handleInputChange('siret', e.target.value)}
                  placeholder="12345678901234"
                  maxLength={14}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  14 chiffres sans espaces
                </p>
              </div>

              {/* Nom établissement */}
              <div>
                <Label htmlFor="establishmentName">Nom de l'établissement *</Label>
                <Input
                  id="establishmentName"
                  value={formData.establishmentName}
                  onChange={(e) => handleInputChange('establishmentName', e.target.value)}
                  placeholder="Centre Formation Test"
                  required
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email de contact professionnel *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@centre-test.fr"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {userData?.email === formData.email ? 
                      "Utilise votre email de connexion" : 
                      "Email professionnel pour les contacts jurys"
                    }
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0123456789"
                    required
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Rue de la Formation"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="75001"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Paris"
                    required
                  />
                </div>
                <div>
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
                <div>
                  <Label htmlFor="responsiblePerson">Personne responsable *</Label>
                  <Input
                    id="responsiblePerson"
                    value={formData.responsiblePerson}
                    onChange={(e) => handleInputChange('responsiblePerson', e.target.value)}
                    placeholder="Marie Martin"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {userData?.name === formData.responsiblePerson ? 
                      "Utilise votre nom de connexion" : 
                      "Nom du responsable pédagogique"
                    }
                  </p>
                </div>
                <div>
                  <Label htmlFor="responsibleRole">Rôle du responsable *</Label>
                  <Input
                    id="responsibleRole"
                    value={formData.responsibleRole}
                    onChange={(e) => handleInputChange('responsibleRole', e.target.value)}
                    placeholder="Directrice pédagogique"
                    required
                  />
                </div>
              </div>

              {/* Domaines de certification */}
              <div>
                <Label>Domaines de certification *</Label>
                <div className="mt-2">
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
                </div>
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
              <div>
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
