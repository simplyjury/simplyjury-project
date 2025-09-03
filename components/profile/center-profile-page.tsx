'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Save, X, Plus, Upload, Trash2, Building2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CenterProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: centerProfileResponse, error, mutate } = useSWR('/api/profile/center', fetcher);
  const profile = centerProfileResponse?.data;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [signedLogoUrl, setSignedLogoUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    centerName: '',
    siretNumber: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    phone: '',
    website: '',
    description: '',
    certificationDomains: [] as string[],
    isCertificateur: false,
    qualiopi: false,
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        centerName: profile.centerName || '',
        siretNumber: profile.siretNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        region: profile.region || '',
        phone: profile.phone || '',
        website: profile.website || '',
        description: profile.description || '',
        certificationDomains: profile.certificationDomains || [],
        isCertificateur: profile.isCertificateur || false,
        qualiopi: profile.qualiopi || false,
        contactPersonName: profile.contactPersonName || '',
        contactPersonEmail: profile.contactPersonEmail || '',
        contactPersonPhone: profile.contactPersonPhone || ''
      });

      if (profile.logoUrl) {
        fetch('/api/profile/center/logo-url')
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setSignedLogoUrl(data.url);
            }
          })
          .catch(() => {});
      }
    }
  }, [profile]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image (JPG, PNG, WebP, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 5MB. Veuillez choisir une image plus petite.');
      return;
    }

    setUploadingLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/center-logo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      const result = await response.json();
      
      const updateResponse = await fetch('/api/profile/center', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: result.url }),
      });
      
      if (updateResponse.ok) {
        mutate();
        setTimeout(() => {
          fetch('/api/profile/center/logo-url')
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setSignedLogoUrl(data.url);
              }
            })
            .catch(() => {});
        }, 1000);
      }
      
    } catch (error) {
      alert('Erreur lors du téléchargement du logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre logo ?')) return;
    
    try {
      const response = await fetch('/api/profile/center', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: null }),
      });
      
      if (response.ok) {
        mutate();
        setSignedLogoUrl(null);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/center', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const initials = profile.centerName?.substring(0, 2).toUpperCase() || 'CF';

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Profil du centre</h1>
        <p className="text-gray-600">Gérez les informations de votre centre de formation</p>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-6 h-6 text-[#0d4a70]" />
          <h2 className="text-xl font-bold text-[#0d4a70]">Logo du centre</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Votre logo aide les jurys à identifier votre centre de formation.
        </p>
        
        <div className="flex items-center gap-6 flex-wrap">
          <div className="relative">
            {signedLogoUrl ? (
              <img
                src={signedLogoUrl}
                alt="Logo du centre"
                className="w-32 h-32 rounded-lg object-cover border-4 border-gray-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold border-4 border-gray-100 ${signedLogoUrl ? 'hidden' : ''}`}>
              {initials}
            </div>
            {uploadingLogo && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-80">
            <div className="mb-4">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Logo actuel</h4>
              <p className="text-sm text-gray-600">
                Format recommandé : JPG, PNG • Taille maximale : 5 MB • Dimensions : 400x400 px minimum
              </p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="flex items-center gap-2 px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a] disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Changer le logo
              </button>
              
              {profile.logoUrl && (
                <button
                  onClick={handleDeleteLogo}
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
          onChange={handleLogoUpload}
          className="hidden"
        />
      </div>

      {/* Company Information Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0d4a70] rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Informations de l'entreprise</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Nom du centre *</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.centerName}
                onChange={(e) => handleInputChange('centerName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.centerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Numéro SIRET *</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.siretNumber}
                onChange={(e) => handleInputChange('siretNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                placeholder="14 chiffres"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.siretNumber}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Adresse *</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.address}</p>
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
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Code postal *</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.postalCode}</p>
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
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Téléphone</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.phone || 'Non renseigné'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Site web</label>
            {isEditing ? (
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                placeholder="https://www.exemple.com"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.website || 'Non renseigné'}</p>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Description du centre</label>
          {isEditing ? (
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent resize-vertical"
              placeholder="Décrivez votre centre de formation, vos spécialités, votre équipe..."
            />
          ) : (
            <p className="px-4 py-3 bg-gray-50 rounded-lg min-h-24">
              {profile.description || 'Aucune description renseignée'}
            </p>
          )}
        </div>

        {/* Certifications Section */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-[#0d4a70] mb-3">Certifications et labels</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCertificateur}
                onChange={(e) => handleInputChange('isCertificateur', e.target.checked)}
                disabled={!isEditing}
                className="w-5 h-5 text-[#13d090] border-gray-300 rounded focus:ring-[#13d090] focus:ring-2"
              />
              <span className="text-gray-700 font-medium">Centre certificateur</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.qualiopi}
                onChange={(e) => handleInputChange('qualiopi', e.target.checked)}
                disabled={!isEditing}
                className="w-5 h-5 text-[#13d090] border-gray-300 rounded focus:ring-[#13d090] focus:ring-2"
              />
              <span className="text-gray-700 font-medium">Certification Qualiopi</span>
            </label>
          </div>
        </div>
      </div>

      {/* Contact Person Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-[#0d4a70] rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <h2 className="text-xl font-bold text-[#0d4a70]">Personne de contact</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Nom du contact *</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.contactPersonName}
                onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.contactPersonName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Email du contact *</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.contactPersonEmail}
                onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.contactPersonEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Téléphone du contact</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.contactPersonPhone}
                onChange={(e) => handleInputChange('contactPersonPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.contactPersonPhone || 'Non renseigné'}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
