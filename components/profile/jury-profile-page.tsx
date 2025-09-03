'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Save, X, Plus, Upload, Trash2, Camera, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { AvailabilityModal } from '@/components/ui/availability-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function JuryProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: juryProfileResponse, error, mutate } = useSWR('/api/profile/jury', fetcher);
  const profile = juryProfileResponse?.data;
  
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [isSaving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number>(1);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    region: '',
    city: '',
    expertiseDomains: [] as string[],
    certifications: [] as string[],
    experienceYears: 0,
    currentPosition: '',
    company: '',
    workModalities: [] as string[],
    interventionZones: [] as string[],
    hourlyRate: '',
    bio: '',
    mainDiploma: '',
    availabilityPreferences: [] as any[]
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        region: profile.region || '',
        city: profile.city || '',
        expertiseDomains: profile.expertiseDomains || [],
        certifications: profile.certifications || [],
        experienceYears: profile.experienceYears || 0,
        currentPosition: profile.currentPosition || '',
        company: profile.company || '',
        workModalities: profile.workModalities || [],
        interventionZones: profile.interventionZones || [],
        hourlyRate: profile.hourlyRate || '',
        bio: profile.bio || '',
        mainDiploma: profile.mainDiploma || '',
        availabilityPreferences: profile.availabilityPreferences || []
      });

      if (profile.profilePhotoUrl) {
        fetch('/api/profile/jury/photo-url')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSignedPhotoUrl(data.url);
            }
          })
          .catch(() => {});
      }
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (sectionNumber: number) => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/jury', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await mutate();
        setEditingSection(null);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch('/api/profile/jury/photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        mutate();
        // Refresh signed URL
        const urlResponse = await fetch('/api/profile/jury/photo-url');
        const urlData = await urlResponse.json();
        if (urlData.success) {
          setSignedPhotoUrl(urlData.url);
        }
      }
    } catch (error) {
      alert('Erreur lors du téléchargement de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const response = await fetch('/api/profile/jury/photo', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSignedPhotoUrl(null);
        mutate();
      }
    } catch (error) {
      alert('Erreur lors de la suppression de la photo');
    }
  };

  const addExpertiseDomain = (domain: string) => {
    if (domain && !formData.expertiseDomains.includes(domain)) {
      handleInputChange('expertiseDomains', [...formData.expertiseDomains, domain]);
    }
  };

  const removeExpertiseDomain = (domain: string) => {
    handleInputChange('expertiseDomains', formData.expertiseDomains.filter(d => d !== domain));
  };

  const toggleWorkModality = (modality: string) => {
    const current = formData.workModalities;
    if (current.includes(modality)) {
      handleInputChange('workModalities', current.filter(m => m !== modality));
    } else {
      handleInputChange('workModalities', [...current, modality]);
    }
  };

  const toggleInterventionZone = (zone: string) => {
    const current = formData.interventionZones;
    if (current.includes(zone)) {
      handleInputChange('interventionZones', current.filter(z => z !== zone));
    } else {
      handleInputChange('interventionZones', [...current, zone]);
    }
  };

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<any>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    startDate: '',
    endDate: '',
    modalities: [] as string[],
    note: ''
  });

  const openAvailabilityModal = (availability?: any) => {
    if (availability) {
      setEditingAvailability(availability);
      setAvailabilityForm({
        startDate: availability.startDate,
        endDate: availability.endDate,
        modalities: availability.modalities || [],
        note: availability.note || ''
      });
    } else {
      setEditingAvailability(null);
      setAvailabilityForm({
        startDate: '',
        endDate: '',
        modalities: [],
        note: ''
      });
    }
    setShowAvailabilityModal(true);
  };

  const saveAvailabilityPeriod = () => {
    const newPeriod = {
      id: editingAvailability?.id || Date.now().toString(),
      ...availabilityForm
    };

    let updatedAvailabilities;
    if (editingAvailability) {
      updatedAvailabilities = formData.availabilityPreferences.map(a => 
        a.id === editingAvailability.id ? newPeriod : a
      );
    } else {
      updatedAvailabilities = [...formData.availabilityPreferences, newPeriod];
    }

    handleInputChange('availabilityPreferences', updatedAvailabilities);
    setShowAvailabilityModal(false);
  };

  const deleteAvailabilityPeriod = (id: string) => {
    const updatedAvailabilities = formData.availabilityPreferences.filter(a => a.id !== id);
    handleInputChange('availabilityPreferences', updatedAvailabilities);
  };

  const toggleAvailabilityModality = (modality: string) => {
    const current = availabilityForm.modalities;
    if (current.includes(modality)) {
      setAvailabilityForm(prev => ({
        ...prev,
        modalities: current.filter(m => m !== modality)
      }));
    } else {
      setAvailabilityForm(prev => ({
        ...prev,
        modalities: [...current, modality]
      }));
    }
  };

  const expertiseOptions = [
    'Développement Web', 'Management', 'Commercial', 'Marketing Digital',
    'Comptabilité', 'Ressources Humaines', 'Formation', 'Communication',
    'Logistique', 'Immobilier', 'Banque/Assurance', 'Tourisme', 'Santé/Social'
  ];

  if (error) return <div className="p-8 text-red-600">Erreur lors du chargement du profil</div>;
  if (!profile) return <div className="p-8">Chargement...</div>;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Mon profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
      </div>

      {/* Photo and Personal Information Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
          onClick={() => setExpandedSection(expandedSection === 1 ? 0 : 1)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#13d090] rounded flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Photo et informations personnelles</h2>
            <p className="text-sm text-gray-500 ml-2">Ajoutez une photo professionnelle et complétez vos informations</p>
          </div>
          <div className="flex items-center gap-2">
            {expandedSection === 1 ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
            {expandedSection === 1 && (
              <>
                {editingSection !== 1 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSection(1);
                    }}
                    className="px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]"
                  >
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection(null);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(1);
                      }}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {expandedSection === 1 && (
          <div className="p-8 pt-0">
            {/* Photo Upload Section */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                {signedPhotoUrl ? (
                  <div className="relative">
                    <img
                      src={signedPhotoUrl}
                      alt="Photo de profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                    {editingSection === 1 && (
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#c4b5fd] flex items-center justify-center text-white text-4xl font-medium">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              
              {editingSection === 1 && (
                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a] disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    {uploadingPhoto ? 'Téléchargement...' : 'Ajouter votre photo de profil'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">Format JPG, PNG, taille max. 2MB</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Prénom *</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Nom de famille *</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Région *</label>
            {editingSection === 1 ? (
              <select
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              >
                <option value="">Sélectionner une région</option>
                <option value="Île-de-France">Île-de-France</option>
                <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                <option value="Occitanie">Occitanie</option>
                <option value="Hauts-de-France">Hauts-de-France</option>
                <option value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</option>
                <option value="Grand Est">Grand Est</option>
                <option value="Pays de la Loire">Pays de la Loire</option>
                <option value="Normandie">Normandie</option>
                <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                <option value="Bretagne">Bretagne</option>
                <option value="Centre-Val de Loire">Centre-Val de Loire</option>
              </select>
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.region}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Ville *</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Années d'expérience</label>
            {editingSection === 1 ? (
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.experienceYears} ans</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Poste actuel *</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.currentPosition}
                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                placeholder="Ex: Directeur Commercial"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.currentPosition}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Entreprise *</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Nom de votre entreprise"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.company}</p>
            )}
          </div>
            </div>
          </div>
        )}
      </div>

      {/* Expertise Domains Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
          onClick={() => setExpandedSection(expandedSection === 2 ? 0 : 2)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#13d090] rounded flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Domaines d'expertise</h2>
            <p className="text-sm text-gray-500 ml-2">Sélectionnez vos domaines de compétence</p>
          </div>
          <div className="flex items-center gap-2">
            {expandedSection === 2 ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
            {expandedSection === 2 && (
              <>
                {editingSection !== 2 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSection(2);
                    }}
                    className="px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]"
                  >
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection(null);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(2);
                      }}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {expandedSection === 2 && (
          <div className="p-8 pt-0">
            {editingSection === 2 ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {expertiseOptions.map((domain) => (
                    <button
                      key={domain}
                      onClick={() => {
                        if (formData.expertiseDomains.includes(domain)) {
                          removeExpertiseDomain(domain);
                        } else {
                          addExpertiseDomain(domain);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.expertiseDomains.includes(domain)
                          ? 'bg-[#13d090] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
                
                {formData.expertiseDomains.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[#0d4a70] mb-2">Domaines sélectionnés :</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.expertiseDomains.map((domain) => (
                        <span
                          key={domain}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#13d090] text-white rounded-full text-sm"
                        >
                          {domain}
                          <button
                            onClick={() => removeExpertiseDomain(domain)}
                            className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.expertiseDomains && profile.expertiseDomains.length > 0 ? (
                  profile.expertiseDomains.map((domain: string) => (
                    <span
                      key={domain}
                      className="px-3 py-1 bg-[#13d090] text-white rounded-full text-sm"
                    >
                      {domain}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Aucun domaine d'expertise renseigné</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Professional Experience Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
          onClick={() => setExpandedSection(expandedSection === 3 ? 0 : 3)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#13d090] rounded flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Expérience professionnelle</h2>
            <p className="text-sm text-gray-500 ml-2">Renseignez votre parcours professionnel actuel</p>
          </div>
          <div className="flex items-center gap-2">
            {expandedSection === 3 ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
            {expandedSection === 3 && (
              <>
                {editingSection !== 3 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSection(3);
                    }}
                    className="px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]"
                  >
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection(null);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(3);
                      }}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {expandedSection === 3 && (
          <div className="p-8 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Années d'expérience *</label>
                {editingSection === 3 ? (
                  <select
                    value={formData.experienceYears}
                    onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="1">1 an</option>
                    <option value="2">2 ans</option>
                    <option value="3">3 ans</option>
                    <option value="4">4 ans</option>
                    <option value="5">5 ans</option>
                    <option value="10">10+ ans</option>
                    <option value="15">15+ ans</option>
                    <option value="20">20+ ans</option>
                  </select>
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.experienceYears} ans</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Diplôme principal</label>
                {editingSection === 3 ? (
                  <input
                    type="text"
                    value={formData.mainDiploma}
                    onChange={(e) => handleInputChange('mainDiploma', e.target.value)}
                    placeholder="Ex: Master Management Commercial"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  />
                ) : (
                  <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.mainDiploma || 'Non renseigné'}</p>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Présentation professionnelle</label>
              {editingSection === 3 ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent resize-vertical"
                  placeholder="Décrivez brièvement votre parcours et vos compétences principales..."
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-lg min-h-24">
                  {profile.bio || 'Aucune présentation professionnelle renseignée'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Work Modalities and Availability Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
          onClick={() => setExpandedSection(expandedSection === 4 ? 0 : 4)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#13d090] rounded flex items-center justify-center text-white font-bold text-sm">
              4
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Modalités et disponibilités</h2>
            <p className="text-sm text-gray-500 ml-2">Indiquez vos préférences pour les sessions de certification</p>
          </div>
          <div className="flex items-center gap-2">
            {expandedSection === 4 ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
            {expandedSection === 4 && (
              <>
                {editingSection !== 4 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSection(4);
                    }}
                    className="px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]"
                  >
                    Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection(null);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(4);
                      }}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {expandedSection === 4 && (
          <div className="p-8 pt-0">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0d4a70] mb-4">Modalités acceptées *</label>
              
              {editingSection === 4 ? (
                <div className="space-y-3">
                  {[
                    { value: 'presentiel', label: 'Présentiel', icon: '🏢' },
                    { value: 'visio', label: 'Visioconférence', icon: '💻' }
                  ].map((modality) => (
                    <label key={modality.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.workModalities.includes(modality.value)}
                        onChange={() => toggleWorkModality(modality.value)}
                        className="w-5 h-5 text-[#13d090] border-gray-300 rounded focus:ring-[#13d090]"
                      />
                      <span className="text-lg">{modality.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{modality.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.workModalities && profile.workModalities.length > 0 ? (
                    profile.workModalities.map((modality: string) => (
                      <span
                        key={modality}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#13d090] text-white rounded-lg text-sm"
                      >
                        {modality === 'presentiel' ? '🏢' : '💻'}
                        {modality === 'presentiel' ? 'Présentiel' : 'Visioconférence'}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune modalité renseignée</p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0d4a70] mb-4">Zone d'intervention (si présentiel) *</label>
              
              {editingSection === 4 ? (
                <div className="space-y-3">
                  {[
                    { value: 'local', label: 'Département local uniquement' },
                    { value: 'regional', label: 'Région complète' },
                    { value: 'national', label: 'National (frais couverts)' }
                  ].map((zone) => (
                    <label key={zone.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interventionZones.includes(zone.value)}
                        onChange={() => toggleInterventionZone(zone.value)}
                        className="w-5 h-5 text-[#13d090] border-gray-300 rounded focus:ring-[#13d090]"
                      />
                      <span className="text-sm font-medium text-gray-700">{zone.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.interventionZones && profile.interventionZones.length > 0 ? (
                    profile.interventionZones.map((zone: string) => {
                      const zoneLabels: {[key: string]: string} = {
                        'local': 'Département local uniquement',
                        'regional': 'Région complète',
                        'national': 'National (frais couverts)'
                      };
                      return (
                        <span
                          key={zone}
                          className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm"
                        >
                          {zoneLabels[zone] || zone}
                        </span>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">Aucune zone d'intervention renseignée</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-[#0d4a70]">Vos disponibilités spécifiques *</label>
                {editingSection === 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAvailabilityModal();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une période
                  </button>
                )}
              </div>
              
              {formData.availabilityPreferences.length > 0 ? (
                <div className="space-y-3">
                  {formData.availabilityPreferences.map((availability) => (
                    <div key={availability.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm font-medium text-[#0d4a70]">
                              Du {new Date(availability.startDate).toLocaleDateString('fr-FR')} au {new Date(availability.endDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {availability.modalities?.map((modality: string) => (
                              <span
                                key={modality}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#13d090] text-white rounded text-xs"
                              >
                                {modality === 'presentiel' ? '🏢' : '💻'}
                                {modality === 'presentiel' ? 'Présentiel' : 'Visio'}
                              </span>
                            ))}
                          </div>
                          
                          {availability.note && (
                            <p className="text-sm text-gray-600">{availability.note}</p>
                          )}
                        </div>
                        
                        {editingSection === 1 && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAvailabilityModal(availability);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAvailabilityPeriod(availability.id);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-400 mb-2">📅</div>
                  <p className="text-gray-500 mb-2">Aucune disponibilité ajoutée</p>
                  {editingSection === 1 && (
                    <p className="text-sm text-gray-400">Cliquez sur "Ajouter une période" pour commencer</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#0d4a70]">
                {editingAvailability ? 'Modifier la période' : 'Ajouter une période de disponibilité'}
              </h3>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Date de début *</label>
                  <input
                    type="date"
                    value={availabilityForm.startDate}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Date de fin *</label>
                  <input
                    type="date"
                    value={availabilityForm.endDate}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-3">Modalités acceptées pour cette période *</label>
                <div className="space-y-2">
                  {[
                    { value: 'presentiel', label: 'Présentiel', icon: '🏢' },
                    { value: 'visio', label: 'Visioconférence', icon: '💻' }
                  ].map((modality) => (
                    <label key={modality.value} className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={availabilityForm.modalities.includes(modality.value)}
                        onChange={() => toggleAvailabilityModality(modality.value)}
                        className="w-5 h-5 text-[#13d090] border-gray-300 rounded focus:ring-[#13d090]"
                      />
                      <span className="text-lg">{modality.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{modality.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Note (optionnelle)</label>
                <textarea
                  value={availabilityForm.note}
                  onChange={(e) => setAvailabilityForm(prev => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  placeholder="Ex: Préférence matin, région PACA uniquement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent resize-vertical"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={saveAvailabilityPeriod}
                disabled={!availabilityForm.startDate || !availabilityForm.endDate || availabilityForm.modalities.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {editingAvailability ? 'Modifier cette période' : 'Ajouter cette période'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
