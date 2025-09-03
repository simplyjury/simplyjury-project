'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Save, X, Plus, Upload, Trash2, Eye, Camera, Calendar, Edit } from 'lucide-react';
import { AvailabilityModal } from '@/components/ui/availability-modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JuryProfile {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  region: string;
  city: string;
  expertiseDomains: string[];
  certifications: string[];
  experienceYears: number;
  currentPosition: string;
  availabilityPreferences: any;
  workModalities: string[];
  interventionZones: string[];
  hourlyRate: string;
  bio: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profileResponse, error, mutate } = useSWR('/api/profile/jury', fetcher);
  const profile = profileResponse?.data;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newZone, setNewZone] = useState('');
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [availabilityPeriods, setAvailabilityPeriods] = useState<Array<{
    id: string;
    startDate: string;
    endDate: string;
    modalities: string[];
    note?: string;
  }>>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    region: '',
    city: '',
    expertiseDomains: [] as string[],
    certifications: [] as string[],
    experienceYears: 0,
    currentPosition: '',
    workModalities: [] as string[],
    interventionZones: [] as string[],
    hourlyRate: '',
    bio: '',
    mainDiploma: ''
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
        workModalities: profile.workModalities || [],
        interventionZones: profile.interventionZones || [],
        hourlyRate: profile.hourlyRate || '',
        bio: profile.bio || '',
        mainDiploma: profile.mainDiploma || ''
      });

      // Load availability periods from profile
      if (profile.availabilityPreferences && Array.isArray(profile.availabilityPreferences)) {
        setAvailabilityPeriods(profile.availabilityPreferences);
      }

      // Fetch signed URL for profile photo if it exists
      if (profile.profilePhotoUrl) {
        fetch('/api/profile/jury/photo-url')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSignedPhotoUrl(data.url);
            }
          })
          .catch(err => {});
      }
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image (JPG, PNG, WebP, GIF)');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5MB. Veuillez choisir une image plus petite.');
      return;
    }

    setUploadingPhoto(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      const result = await response.json();
      
      // Update profile with new photo URL
      const updateResponse = await fetch('/api/profile/jury', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhotoUrl: result.url }),
      });
      
      if (updateResponse.ok) {
        mutate(); // Refresh profile data
        setPhotoPreview(null);
        // Refresh signed URL for new photo
        setTimeout(() => {
          fetch('/api/profile/jury/photo-url')
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setSignedPhotoUrl(data.url);
              }
            })
            .catch(err => {});
        }, 1000);
      }
      
    } catch (error) {
      alert('Erreur lors du téléchargement de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) return;
    
    try {
      const response = await fetch('/api/profile/jury', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhotoUrl: null }),
      });
      
      if (response.ok) {
        mutate();
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.expertiseDomains.includes(newSkill.trim())) {
      handleInputChange('expertiseDomains', [...formData.expertiseDomains, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    handleInputChange('expertiseDomains', formData.expertiseDomains.filter(s => s !== skill));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      handleInputChange('certifications', [...formData.certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const removeCertification = (certToRemove: string) => {
    handleInputChange('certifications', formData.certifications.filter(cert => cert !== certToRemove));
  };

  const addZone = () => {
    if (newZone.trim() && !formData.interventionZones.includes(newZone.trim())) {
      handleInputChange('interventionZones', [...formData.interventionZones, newZone.trim()]);
      setNewZone('');
    }
  };

  const removeZone = (zoneToRemove: string) => {
    handleInputChange('interventionZones', formData.interventionZones.filter(zone => zone !== zoneToRemove));
  };

  // Availability period functions
  const addAvailabilityPeriod = (period: { startDate: string; endDate: string; modalities: string[]; note?: string }) => {
    const newPeriod = {
      ...period,
      id: Date.now().toString()
    };
    setAvailabilityPeriods(prev => [...prev, newPeriod]);
  };

  const updateAvailabilityPeriod = (updatedPeriod: { id: string; startDate: string; endDate: string; modalities: string[]; note?: string }) => {
    setAvailabilityPeriods(prev => prev.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
  };

  const deleteAvailabilityPeriod = (periodId: string) => {
    setAvailabilityPeriods(prev => prev.filter(p => p.id !== periodId));
  };

  const openAvailabilityModal = () => {
    setEditingPeriod(null);
    setShowAvailabilityModal(true);
  };

  const editAvailabilityPeriod = (period: any) => {
    setEditingPeriod(period);
    setShowAvailabilityModal(true);
  };

  const closeAvailabilityModal = () => {
    setShowAvailabilityModal(false);
    setEditingPeriod(null);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/profile/jury', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          availabilityPreferences: availabilityPeriods
        }),
      });
      
      if (response.ok) {
        mutate();
        setIsEditing(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="p-8 text-red-600">Erreur lors du chargement du profil</div>;
  if (!profile) return <div className="p-8">Chargement...</div>;


  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Mon profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8" style={{width: '100%', maxWidth: 'none'}}>
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-6 h-6 text-[#0d4a70]" />
          <h2 className="text-xl font-bold text-[#0d4a70]">Photo de profil</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Votre photo de profil aide les centres de formation à mieux vous identifier.
        </p>
        
        <div className="flex items-center gap-6 flex-wrap">
          <div className="relative">
            {signedPhotoUrl ? (
              <img
                src={signedPhotoUrl}
                alt="Photo de profil"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold border-4 border-gray-100 ${signedPhotoUrl ? 'hidden' : ''}`}>
              {initials}
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-80">
            <div className="mb-4">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Photo actuelle</h4>
              <p className="text-sm text-gray-600">
                Format recommandé : JPG, PNG • Taille maximale : 5 MB • Dimensions : 400x400 px minimum
              </p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a] disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Changer la photo
              </button>
              
              {profile.profilePhotoUrl && (
                <button
                  onClick={handleDeletePhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8" style={{width: '100%', maxWidth: 'none'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0d4a70] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Informations personnelles</h2>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]"
            >
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Prénom *</label>
            {isEditing ? (
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
            {isEditing ? (
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
            {isEditing ? (
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
            {isEditing ? (
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
            {isEditing ? (
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
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Poste actuel</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.currentPosition}
                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.currentPosition}</p>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mt-8">
          <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Domaines d'expertise</label>
          {isEditing && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Ajouter un domaine d'expertise"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.expertiseDomains.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-[#0d4a70] rounded-full text-sm font-medium"
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Certifications</label>
          {isEditing && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="Ajouter une certification"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addCertification()}
              />
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {formData.certifications.map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-[#0d4a70] rounded-full text-sm font-medium"
              >
                {cert}
                {isEditing && (
                  <button
                    onClick={() => removeCertification(cert)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Présentation professionnelle</label>
          {isEditing ? (
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

      {/* Professional Experience Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8" style={{width: '100%', maxWidth: 'none'}}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-[#0d4a70] rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <h2 className="text-xl font-bold text-[#0d4a70]">Expérience professionnelle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Poste actuel *</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.currentPosition}
                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                placeholder="Ex: Directeur Commercial"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.currentPosition}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Années d'expérience *</label>
            {isEditing ? (
              <select
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              >
                <option value="">Sélectionnez</option>
                <option value={1}>1-2 ans</option>
                <option value={3}>3-5 ans</option>
                <option value={6}>6-10 ans</option>
                <option value={11}>11-15 ans</option>
                <option value={16}>16-20 ans</option>
                <option value={21}>Plus de 20 ans</option>
              </select>
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">
                {profile.experienceYears === 1 ? '1-2 ans' :
                 profile.experienceYears === 3 ? '3-5 ans' :
                 profile.experienceYears === 6 ? '6-10 ans' :
                 profile.experienceYears === 11 ? '11-15 ans' :
                 profile.experienceYears === 16 ? '16-20 ans' :
                 profile.experienceYears === 21 ? 'Plus de 20 ans' :
                 `${profile.experienceYears} ans`}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Diplôme principal</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.mainDiploma || ''}
              onChange={(e) => handleInputChange('mainDiploma', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              placeholder="Ex: Master Management Commercial"
            />
          ) : (
            <p className="px-4 py-3 bg-gray-50 rounded-lg">
              {profile.mainDiploma || 'Aucun diplôme principal renseigné'}
            </p>
          )}
        </div>
      </div>

      {/* Modalities and Availability Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8" style={{width: '100%', maxWidth: 'none'}}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-[#0d4a70] rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <h2 className="text-xl font-bold text-[#0d4a70]">Modalités et disponibilités</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Indiquez vos préférences pour les sessions de certification
        </p>

        <div className="space-y-6">
          {/* Work Modalities */}
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-3">Modalités acceptées *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {[
                { display: 'Présentiel', value: 'presentiel' },
                { display: 'Visioconférence', value: 'visio' }
              ].map((modality) => (
                <label key={modality.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.workModalities?.includes(modality.value) || false}
                    onChange={(e) => {
                      const current = formData.workModalities || [];
                      if (e.target.checked) {
                        handleInputChange('workModalities', [...current, modality.value]);
                      } else {
                        handleInputChange('workModalities', current.filter(m => m !== modality.value));
                      }
                    }}
                    disabled={!isEditing}
                    className="w-5 h-5 text-[#13d090] border-gray-300 rounded focus:ring-[#13d090] focus:ring-2"
                  />
                  <span className="text-gray-700 font-medium">{modality.display}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intervention Zones */}
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Zones d'intervention</label>
            {isEditing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newZone || ''}
                  onChange={(e) => setNewZone(e.target.value)}
                  placeholder="Ajouter une zone..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addZone();
                    }
                  }}
                />
                <button
                  onClick={addZone}
                  type="button"
                  className="px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {(formData.interventionZones || []).map((zone, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-[#0d4a70] rounded-full text-sm font-medium"
                >
                  {zone}
                  {isEditing && (
                    <button
                      onClick={() => removeZone(zone)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Tarif horaire (€)</label>
            {isEditing ? (
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                placeholder="Ex: 150"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg w-full md:w-48">
                {profile.hourlyRate ? `${profile.hourlyRate} €/h` : 'Non renseigné'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Availability Periods Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8" style={{width: '100%', maxWidth: 'none'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0d4a70] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Périodes de disponibilité</h2>
          </div>
          
          <button
            onClick={openAvailabilityModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]"
          >
            <Plus className="w-4 h-4" />
            Ajouter une période
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Définissez vos créneaux de disponibilité pour les sessions de certification
        </p>

        {availabilityPeriods.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-medium text-gray-500 mb-1">Aucune disponibilité ajoutée</p>
            <p className="text-sm text-gray-400">Cliquez sur "Ajouter une période" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilityPeriods.map((period) => (
              <div key={period.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold text-[#0d4a70]">
                        {new Date(period.startDate).toLocaleDateString('fr-FR')} - {new Date(period.endDate).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex gap-2">
                        {period.modalities.map((modality) => (
                          <span
                            key={modality}
                            className="inline-flex items-center px-2 py-1 bg-[#13d090] text-white text-xs rounded-full"
                          >
                            {modality === 'presentiel' ? 'Présentiel' : 'Visioconférence'}
                          </span>
                        ))}
                      </div>
                    </div>
                    {period.note && (
                      <p className="text-sm text-gray-600">{period.note}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => editAvailabilityPeriod(period)}
                      className="p-2 text-gray-500 hover:text-[#0d4a70] hover:bg-white rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAvailabilityPeriod(period.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={closeAvailabilityModal}
        onSave={addAvailabilityPeriod}
        existingPeriods={availabilityPeriods}
        editingPeriod={editingPeriod}
        onUpdate={updateAvailabilityPeriod}
      />
    </section>
  );
}
