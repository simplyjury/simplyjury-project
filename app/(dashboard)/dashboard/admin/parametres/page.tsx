'use client';

import { Settings, Shield, Bell, Database, Mail, Key, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ParametresPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingMaintenanceState, setPendingMaintenanceState] = useState(false);

  // Load current maintenance settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/maintenance');
        if (response.ok) {
          const data = await response.json();
          setMaintenanceMode(data.maintenanceMode);
          setMaintenanceMessage(data.maintenanceMessage || '');
        }
      } catch (error) {
        console.error('Error loading maintenance settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle maintenance mode toggle with confirmation
  const handleMaintenanceToggle = (enabled: boolean) => {
    setPendingMaintenanceState(enabled);
    setShowConfirmModal(true);
  };

  // Confirm and execute maintenance mode change
  const confirmMaintenanceToggle = async () => {
    setSaving(true);
    setShowConfirmModal(false);
    
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maintenanceMode: pendingMaintenanceState,
          maintenanceMessage: maintenanceMessage,
        }),
      });

      if (response.ok) {
        setMaintenanceMode(pendingMaintenanceState);
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating maintenance mode:', error);
      alert('Erreur lors de la mise à jour du mode maintenance');
    } finally {
      setSaving(false);
    }
  };

  // Cancel maintenance mode change
  const cancelMaintenanceToggle = () => {
    setShowConfirmModal(false);
    setPendingMaintenanceState(false);
  };
  return (
    <section className="flex-1 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Paramètres</h1>
        <p className="text-gray-600">Configuration générale de la plateforme</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* System Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-[#0d4a70]" />
            <h3 className="text-lg font-semibold text-[#0d4a70]">Paramètres système</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Mode maintenance</label>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#13d090] border-gray-300 rounded" 
                  checked={maintenanceMode}
                  onChange={(e) => handleMaintenanceToggle(e.target.checked)}
                  disabled={loading || saving}
                />
                <span className="text-sm text-gray-700">
                  {saving ? 'Mise à jour...' : 'Activer le mode maintenance'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Empêche l'accès à la plateforme pour les utilisateurs (seuls les administrateurs peuvent se connecter)
              </p>
              {maintenanceMode && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-[#0d4a70] mb-1">Message de maintenance (optionnel)</label>
                  <textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="Message personnalisé affiché sur la page de maintenance"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                    rows={2}
                    disabled={saving}
                  />
                  <button
                    onClick={() => handleMaintenanceToggle(true)}
                    disabled={saving}
                    className="mt-2 px-3 py-1 text-xs bg-[#13d090] text-white rounded hover:bg-[#10b87a] disabled:opacity-50"
                  >
                    Mettre à jour le message
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Inscriptions</label>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" defaultChecked />
                <span className="text-sm text-gray-700">Autoriser les nouvelles inscriptions</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Permet aux nouveaux utilisateurs de s'inscrire</p>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-[#0d4a70]" />
            <h3 className="text-lg font-semibold text-[#0d4a70]">Sécurité</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Validation automatique</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">Auto-validation des profils jurys</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" />
                  <span className="text-sm text-gray-700">Auto-validation des centres</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Durée de session</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
                <option value="1">1 heure</option>
                <option value="8">8 heures</option>
                <option value="24" selected>24 heures</option>
                <option value="168">7 jours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-6 h-6 text-[#0d4a70]" />
            <h3 className="text-lg font-semibold text-[#0d4a70]">Configuration email</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Email expéditeur</label>
              <input
                type="email"
                defaultValue="noreply@simplyjury.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Nom expéditeur</label>
              <input
                type="text"
                defaultValue="SimplyJury"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Notifications automatiques</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" defaultChecked />
                <span className="text-sm text-gray-700">Email de bienvenue</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" defaultChecked />
                <span className="text-sm text-gray-700">Validation de profil</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-[#13d090] border-gray-300 rounded" defaultChecked />
                <span className="text-sm text-gray-700">Nouvelles mises en relation</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-6 h-6 text-[#0d4a70]" />
            <h3 className="text-lg font-semibold text-[#0d4a70]">API et intégrations</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">France Compétences API</label>
              <div className="flex items-center gap-4">
                <input
                  type="password"
                  placeholder="Clé API France Compétences"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
                />
                <button className="px-4 py-2 bg-[#0d4a70] text-white rounded-lg hover:bg-[#0a3a5a]">
                  Tester
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Limite de requêtes API</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
                <option value="100">100 requêtes/heure</option>
                <option value="500" selected>500 requêtes/heure</option>
                <option value="1000">1000 requêtes/heure</option>
                <option value="unlimited">Illimitées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-[#0d4a70]" />
            <h3 className="text-lg font-semibold text-[#0d4a70]">Paramètres de la plateforme</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Nom de la plateforme</label>
              <input
                type="text"
                defaultValue="SimplyJury"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">URL de base</label>
              <input
                type="url"
                defaultValue="https://simplyjury.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Fuseau horaire</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
                <option value="Europe/Paris" selected>Europe/Paris (UTC+1)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0d4a70] mb-2">Langue par défaut</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent">
                <option value="fr" selected>Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#13d090] text-white rounded-lg hover:bg-[#10b87a]">
            <Settings className="w-4 h-4" />
            Sauvegarder les paramètres
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#0d4a70] mb-2">
                {pendingMaintenanceState ? 'Activer le mode maintenance' : 'Désactiver le mode maintenance'}
              </h3>
              <p className="text-gray-600 text-sm">
                {pendingMaintenanceState 
                  ? 'Êtes-vous sûr de vouloir activer le mode maintenance ? Cela rendra la plateforme inaccessible pour tous les utilisateurs sauf les administrateurs.'
                  : 'Êtes-vous sûr de vouloir désactiver le mode maintenance ? La plateforme redeviendra accessible à tous les utilisateurs.'
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelMaintenanceToggle}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={confirmMaintenanceToggle}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  pendingMaintenanceState 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-[#13d090] hover:bg-[#10b87a]'
                }`}
                disabled={saving}
              >
                {saving ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
