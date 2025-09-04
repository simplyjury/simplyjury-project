'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Save, X, Plus, Upload, Trash2, Building2, ChevronDown, ChevronUp } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CenterProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: centerProfileResponse, error, mutate } = useSWR('/api/profile/center', fetcher);
  const profile = centerProfileResponse?.data;
  
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [isSaving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [signedLogoUrl, setSignedLogoUrl] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number>(1);
  
  const [formData, setFormData] = useState({
    name: '',
    siret: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    phone: '',
    website: '',
    description: '',
    sector: '',
    email: '',
    certificationDomains: [] as string[],
    isCertificateur: false,
    qualiopiCertified: false,
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    contactPersonRole: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        siret: profile.siret || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        region: profile.region || '',
        phone: profile.phone || '',
        website: profile.website || '',
        description: profile.description || '',
        sector: profile.sector || '',
        email: profile.email || '',
        certificationDomains: profile.certificationDomains || [],
        isCertificateur: profile.isCertificateur || false,
        qualiopiCertified: profile.qualiopiCertified || false,
        contactPersonName: profile.contactPersonName || '',
        contactPersonEmail: profile.contactPersonEmail || '',
        contactPersonPhone: profile.contactPersonPhone || '',
        contactPersonRole: profile.contactPersonRole || ''
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

  const addCertificationDomain = (domain: string) => {
    if (domain && !formData.certificationDomains.includes(domain)) {
      handleInputChange('certificationDomains', [...formData.certificationDomains, domain]);
    }
  };

  const removeCertificationDomain = (domain: string) => {
    handleInputChange('certificationDomains', formData.certificationDomains.filter(d => d !== domain));
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

  const handleSave = async (sectionNumber: number) => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/center', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        mutate();
        setEditingSection(null);
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

  const initials = profile.name?.substring(0, 2).toUpperCase() || 'CF';

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
          onClick={() => setExpandedSection(expandedSection === 1 ? 0 : 1)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#13d090] rounded flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Informations de l'entreprise</h2>
            <p className="text-sm text-gray-500 ml-2">Gérez les informations de votre centre de formation</p>
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
          <div className="p-6 pt-0">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Nom du centre *</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Numéro SIRET *</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => handleInputChange('siret', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                placeholder="14 chiffres"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.siret}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Adresse *</label>
            {editingSection === 1 ? (
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
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Code postal *</label>
            {editingSection === 1 ? (
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
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Téléphone</label>
            {editingSection === 1 ? (
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
            {editingSection === 1 ? (
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

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Secteur d'activité</label>
            {editingSection === 1 ? (
              <input
                type="text"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.sector || 'Non renseigné'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Description</label>
            {editingSection === 1 ? (
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                placeholder="Décrivez votre centre de formation..."
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.description || 'Non renseigné'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Email *</label>
            {editingSection === 1 ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.email}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Domaines de certification</label>
            {editingSection === 1 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.certificationDomains.map((domain, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#13d090] text-white rounded-full text-sm"
                    >
                      {domain}
                      <button
                        onClick={() => removeCertificationDomain(domain)}
                        className="ml-1 hover:bg-[#10b87a] rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ajouter un domaine (appuyez sur Entrée)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value) {
                        addCertificationDomain(value);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.certificationDomains?.length > 0 ? (
                  profile.certificationDomains.map((domain: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {domain}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Aucun domaine renseigné</p>
                )}
              </div>
            )}
          </div>
        </div>
          </div>
        )}
      </div>

      {/* Contact Person Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
          onClick={() => setExpandedSection(expandedSection === 2 ? 0 : 2)}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#13d090] rounded flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <h2 className="text-xl font-bold text-[#0d4a70]">Personne de contact</h2>
            <p className="text-sm text-gray-500 ml-2">Informations de la personne de contact</p>
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
          <div className="p-6 pt-0">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Email du contact *</label>
            {editingSection === 2 ? (
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
            {editingSection === 2 ? (
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

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Rôle du contact</label>
            {editingSection === 2 ? (
              <input
                type="text"
                value={formData.contactPersonRole}
                onChange={(e) => handleInputChange('contactPersonRole', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                placeholder="Directeur, Responsable formation..."
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.contactPersonRole || 'Non renseigné'}</p>
            )}
          </div>
        </div>
          </div>
        )}
      </div>
    </section>
  );
}
