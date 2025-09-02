'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AvailabilityModal } from '@/components/ui/availability-modal';
import { Trash2, Upload, Plus, X, Edit, Camera, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const regions = [
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
  'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine',
  'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
];

const certificationDomains = [
  'Développement Web', 'Management', 'Commercial', 'Marketing Digital', 'Comptabilité', 'Ressources Humaines',
  'Formation', 'Communication', 'Logistique', 'Immobilier', 'Banque/Assurance', 'Tourisme',
  'Santé/Social', 'Artisanat', 'Informatique', 'Gestion', 'Éducation', 'Industrie', 'BTP', 'Transport'
];

type AvailabilityPeriod = {
  id: string;
  startDate: string;
  endDate: string;
  modalities: string[];
  note?: string;
};

export default function JuryProfilePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    region: '',
    city: '',
    company: '',
    diploma: '',
    expertiseDomains: [] as string[],
    certifications: '',
    yearsExperience: '',
    currentPosition: '',
    workModes: [] as string[],
    interventionZones: [] as string[],
    hourlyRate: '',
    bio: '',
    profilePhoto: null as File | null
  });

  const [availabilityPeriods, setAvailabilityPeriods] = useState<Array<{
    id: string;
    startDate: string;
    endDate: string;
    modalities: string[];
    notes?: string;
  }>>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AvailabilityPeriod | null>(null);
  const [currentAvailability, setCurrentAvailability] = useState<Partial<AvailabilityPeriod>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image (JPG, PNG, WebP, GIF)');
        return;
      }
      
      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB. Veuillez choisir une image plus petite.');
        return;
      }

      setFormData(prev => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleExpertiseDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      expertiseDomains: prev.expertiseDomains.includes(domain)
        ? prev.expertiseDomains.filter(d => d !== domain)
        : [...prev.expertiseDomains, domain]
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

  const handleInterventionZoneChange = (zone: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interventionZones: checked 
        ? [...prev.interventionZones, zone]
        : prev.interventionZones.filter(z => z !== zone)
    }));
  };

  const addAvailabilityPeriod = (period: Omit<AvailabilityPeriod, 'id'>) => {
    const newPeriod = {
      ...period,
      id: Date.now().toString()
    };
    setAvailabilityPeriods(prev => [...prev, newPeriod]);
  };

  const updateAvailabilityPeriod = (updatedPeriod: AvailabilityPeriod) => {
    setAvailabilityPeriods(prev => 
      prev.map(period => 
        period.id === updatedPeriod.id ? updatedPeriod : period
      )
    );
  };

  const editAvailabilityPeriod = (period: AvailabilityPeriod) => {
    setEditingPeriod(period);
    setShowAvailabilityModal(true);
  };

  const closeAvailabilityModal = () => {
    setShowAvailabilityModal(false);
    setEditingPeriod(null);
  };

  const removeAvailabilityPeriod = (id: string) => {
    setAvailabilityPeriods(prev => prev.filter(period => period.id !== id));
  };

  const addDomain = () => {
    if (selectedDomain && !formData.expertiseDomains.includes(selectedDomain)) {
      handleInputChange('expertiseDomains', [...formData.expertiseDomains, selectedDomain]);
      setSelectedDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    handleInputChange('expertiseDomains', formData.expertiseDomains.filter(d => d !== domain));
  };

  const addZone = () => {
    if (selectedZone && !formData.interventionZones.includes(selectedZone)) {
      handleInputChange('interventionZones', [...formData.interventionZones, selectedZone]);
      setSelectedZone('');
    }
  };

  const removeZone = (zone: string) => {
    handleInputChange('interventionZones', formData.interventionZones.filter(z => z !== zone));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let profilePhotoUrl = null;

      // Upload profile picture if one was selected
      if (formData.profilePhoto) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.profilePhoto);

        const uploadResponse = await fetch('/api/upload/profile-picture', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          profilePhotoUrl = uploadResult.url;
        } else {
          console.error('Erreur lors du téléchargement de la photo');
        }
      }

      // Transform work modalities to match database constraint
      const transformedWorkModes = formData.workModes.map(mode => {
        if (mode === 'Présentiel') return 'presentiel';
        if (mode === 'Visioconférence') return 'visio';
        return mode.toLowerCase();
      });

      const submitData = {
        ...formData,
        profilePhotoUrl,
        workModes: transformedWorkModes,
        availabilityPreferences: availabilityPeriods
      };
      
      const response = await fetch('/api/profile/jury', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
            {/* Photo de profil */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4ade80] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d4a70]">Photo et informations personnelles</h3>
                  <p className="text-sm text-gray-600">Ajoutez une photo professionnelle et complétez vos informations</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-[#bea1e5] hover:bg-[#a891d4] text-white rounded-full p-1"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ajoutez une photo de profil professionnelle</p>
                  <p className="text-xs text-gray-500">Format recommandé: JPG, PNG (max 5MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="space-y-4">
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Votre ville"
                  />
                </div>
              </div>
            </div>

            {/* Expertise professionnelle */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4ade80] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d4a70]">Domaines d'expertise</h3>
                  <p className="text-sm text-gray-600">Sélectionnez vos domaines de compétence</p>
                </div>
              </div>
              
              <div>
                <div className="flex flex-wrap gap-3">
                  {certificationDomains.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => {
                        if (formData.expertiseDomains.includes(domain)) {
                          removeDomain(domain);
                        } else {
                          handleInputChange('expertiseDomains', [...formData.expertiseDomains, domain]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        formData.expertiseDomains.includes(domain)
                          ? 'bg-[#0d4a70] text-white border-[#0d4a70]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#0d4a70] hover:text-[#0d4a70]'
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Expérience professionnelle */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4ade80] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d4a70]">Expérience professionnelle</h3>
                  <p className="text-sm text-gray-600">Décrivez votre parcours professionnel actuel</p>
                </div>
              </div>

              <div>
                <Label htmlFor="currentPosition">Poste actuel *</Label>
                <Input
                  id="currentPosition"
                  value={formData.currentPosition}
                  onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                  placeholder="Consultant en formation professionnelle"
                />
              </div>

              <div>
                <Label htmlFor="certifications">Certifications</Label>
                <Input
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="Listez vos certifications principales..."
                />
              </div>

              <div>
                <Label htmlFor="yearsExperience">Années d'expérience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            {/* Modalités et disponibilités */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4ade80] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d4a70]">Modalités et disponibilités</h3>
                  <p className="text-sm text-gray-600">Indiquez vos préférences pour les sessions de certification</p>
                </div>
              </div>
              
              {/* Modalités acceptées */}
              <div>
                <Label className="text-sm font-medium">Modalités acceptées *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {['Présentiel', 'Visioconférence'].map((modality) => (
                    <div
                      key={modality}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.workModes.includes(modality)
                          ? 'border-[#4ade80] bg-[#4ade80]/5'
                          : 'border-gray-300 hover:border-[#4ade80]'
                      }`}
                      onClick={() => {
                        if (formData.workModes.includes(modality)) {
                          handleInputChange('workModes', formData.workModes.filter(m => m !== modality));
                        } else {
                          handleInputChange('workModes', [...formData.workModes, modality]);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.workModes.includes(modality)
                            ? 'border-[#4ade80] bg-[#4ade80]'
                            : 'border-gray-300'
                        }`}>
                          {formData.workModes.includes(modality) && (
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          )}
                        </div>
                        <span className="font-medium">{modality}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone d'intervention */}
              <div>
                <Label className="text-sm font-medium">Zone d'intervention (si présentiel) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {[
                    'Département local uniquement',
                    'Région complète', 
                    'National (frais couverts)'
                  ].map((zone) => (
                    <div
                      key={zone}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.interventionZones.includes(zone)
                          ? 'border-[#4ade80] bg-[#4ade80]/5'
                          : 'border-gray-300 hover:border-[#4ade80]'
                      }`}
                      onClick={() => {
                        if (formData.interventionZones.includes(zone)) {
                          handleInputChange('interventionZones', formData.interventionZones.filter(z => z !== zone));
                        } else {
                          handleInputChange('interventionZones', [...formData.interventionZones, zone]);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.interventionZones.includes(zone)
                            ? 'border-[#4ade80] bg-[#4ade80]'
                            : 'border-gray-300'
                        }`}>
                          {formData.interventionZones.includes(zone) && (
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{zone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vos disponibilités spécifiques */}
              <div>
                <Label className="text-sm font-medium">Vos disponibilités spécifiques *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mt-2 text-center">
                  <div className="flex flex-col items-center justify-between">
                    <div className="text-left w-full mb-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Ajoutez vos créneaux de disponibilité pour que les centres puissent connaître vos dates libres
                      </p>
                      <Button
                        type="button"
                        onClick={() => setShowAvailabilityModal(true)}
                        className="bg-[#4ade80] hover:bg-[#22c55e] text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une période
                      </Button>
                    </div>
                    
                    {availabilityPeriods.length === 0 ? (
                      <div className="text-center">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="font-medium text-gray-500">Aucune disponibilité ajoutée</p>
                        <p className="text-sm text-gray-400">Cliquez sur "Ajouter une période" pour commencer</p>
                      </div>
                    ) : (
                      <div className="w-full space-y-2">
                        {availabilityPeriods.map((period) => (
                          <div key={period.id} className="border rounded-lg p-3 bg-white text-left">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  Du {new Date(period.startDate).toLocaleDateString('fr-FR')} au {new Date(period.endDate).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Modalités: {period.modalities.join(', ')}
                                </p>
                                {period.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{period.notes}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editAvailabilityPeriod(period)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAvailabilityPeriod(period.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={closeAvailabilityModal}
        onSave={addAvailabilityPeriod}
        existingPeriods={availabilityPeriods}
        editingPeriod={editingPeriod}
        onUpdate={updateAvailabilityPeriod}
      />
    </div>
  );
}
