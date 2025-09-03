'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Save, X, Upload, Trash2, User, Shield } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: adminProfileResponse, error, mutate } = useSWR('/api/profile/admin', fetcher);
  const profile = adminProfileResponse?.data;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    position: '',
    bio: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        department: profile.department || '',
        position: profile.position || '',
        bio: profile.bio || ''
      });

      if (profile.profilePhotoUrl) {
        fetch('/api/profile/admin/photo-url')
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await mutate();
        setIsEditing(false);
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

      const response = await fetch('/api/profile/admin/photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        mutate();
        // Refresh signed URL
        const urlResponse = await fetch('/api/profile/admin/photo-url');
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
      const response = await fetch('/api/profile/admin/photo', {
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

  if (error) return <div className="p-8 text-red-600">Erreur lors du chargement du profil</div>;
  if (!profile) return <div className="p-8">Chargement...</div>;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Profil Administrateur</h1>
        <p className="text-gray-600">Gérez vos informations personnelles d'administrateur</p>
      </div>

      {/* Photo and Personal Information Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0d4a70]" />
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
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Annuler
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
                {isEditing && (
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#0d4a70] flex items-center justify-center text-white text-4xl font-medium">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>
          
          {isEditing && (
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
                <Upload className="w-4 h-4" />
                {uploadingPhoto ? 'Téléchargement...' : 'Ajouter votre photo de profil'}
              </button>
              <p className="text-sm text-gray-500 mt-2">Format JPG, PNG, taille max. 2MB</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Département</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Ex: Administration"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.department || 'Non renseigné'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Poste</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ex: Administrateur système"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.position || 'Non renseigné'}</p>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Notes personnelles</label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent resize-vertical"
              placeholder="Notes personnelles ou informations complémentaires..."
            />
          ) : (
            <p className="px-4 py-3 bg-gray-50 rounded-lg min-h-24">
              {profile.bio || 'Aucune note personnelle renseignée'}
            </p>
          )}
        </div>
      </div>

      {/* System Information Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-[#0d4a70]" />
          <h2 className="text-xl font-bold text-[#0d4a70]">Informations système</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Email</label>
            <p className="px-4 py-3 bg-gray-50 rounded-lg">{profile.email}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Type d'utilisateur</label>
            <p className="px-4 py-3 bg-gray-50 rounded-lg">
              <span className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0d4a70]" />
                Administrateur
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Statut du compte</label>
            <p className="px-4 py-3 bg-gray-50 rounded-lg">
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Actif
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Dernière connexion</label>
            <p className="px-4 py-3 bg-gray-50 rounded-lg">
              {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString('fr-FR') : 'Jamais connecté'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
