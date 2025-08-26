'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

const regions = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
  'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine',
  'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
];

const certificationDomains = [
  'Informatique', 'Gestion', 'Commerce', 'Santé', 'Éducation', 'Industrie',
  'BTP', 'Transport', 'Hôtellerie-Restauration', 'Agriculture', 'Artisanat'
];

export default function JuryProfilePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    region: '',
    expertiseDomains: [] as string[],
    certifications: '',
    yearsExperience: '',
    currentPosition: '',
    workModes: [] as string[],
    interventionZones: [] as string[],
    hourlyRate: '',
    bio: ''
  });

  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedZone, setSelectedZone] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDomain = () => {
    if (selectedDomain && !formData.expertiseDomains.includes(selectedDomain)) {
      setFormData(prev => ({
        ...prev,
        expertiseDomains: [...prev.expertiseDomains, selectedDomain]
      }));
      setSelectedDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseDomains: prev.expertiseDomains.filter(d => d !== domain)
    }));
  };

  const addZone = () => {
    if (selectedZone && !formData.interventionZones.includes(selectedZone)) {
      setFormData(prev => ({
        ...prev,
        interventionZones: [...prev.interventionZones, selectedZone]
      }));
      setSelectedZone('');
    }
  };

  const removeZone = (zone: string) => {
    setFormData(prev => ({
      ...prev,
      interventionZones: prev.interventionZones.filter(z => z !== zone)
    }));
  };

  const handleWorkModeChange = (mode: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      workModes: checked 
        ? [...prev.workModes, mode]
        : prev.workModes.filter(m => m !== mode)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profile/jury', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        console.error('Erreur lors de la création du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#0d4a70]">
            Complétez votre profil Jury Professionnel
          </CardTitle>
          <CardDescription>
            Ces informations nous permettront de mieux vous accompagner dans vos missions d'évaluation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="region">Région *</Label>
                <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner votre région" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expertise professionnelle */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Expertise professionnelle</h3>
              
              <div>
                <Label>Domaines d'expertise *</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Ajouter un domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificationDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addDomain} disabled={!selectedDomain}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.expertiseDomains.map((domain) => (
                    <Badge key={domain} variant="secondary" className="bg-[#13d090]/10 text-[#0d4a70]">
                      {domain}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeDomain(domain)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="certifications">Certifications détenues</Label>
                <Textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="Listez vos certifications professionnelles..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearsExperience">Années d'expérience *</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currentPosition">Poste actuel *</Label>
                  <Input
                    id="currentPosition"
                    value={formData.currentPosition}
                    onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Modalités de travail */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Modalités de travail</h3>
              
              <div>
                <Label>Modalités de travail *</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="presentiel"
                      checked={formData.workModes.includes('presentiel')}
                      onCheckedChange={(checked) => handleWorkModeChange('presentiel', checked as boolean)}
                    />
                    <Label htmlFor="presentiel">Présentiel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visio"
                      checked={formData.workModes.includes('visio')}
                      onCheckedChange={(checked) => handleWorkModeChange('visio', checked as boolean)}
                    />
                    <Label htmlFor="visio">Visioconférence</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Zones d'intervention</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Ajouter une zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addZone} disabled={!selectedZone}>
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.interventionZones.map((zone) => (
                    <Badge key={zone} variant="secondary" className="bg-[#bea1e5]/10 text-[#0d4a70]">
                      {zone}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeZone(zone)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="150.00"
                />
              </div>
            </div>

            {/* Présentation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0d4a70]">Présentation</h3>
              
              <div>
                <Label htmlFor="bio">Biographie professionnelle</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Décrivez votre parcours professionnel et votre expertise..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#0d4a70] hover:bg-[#0c608a] text-white px-8 py-2"
              >
                Créer mon profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
