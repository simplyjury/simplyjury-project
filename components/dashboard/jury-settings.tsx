'use client';

import { useState } from 'react';
import { Bell, Shield, Download, Trash2, AlertCircle } from 'lucide-react';

export default function JurySettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    newRequests: true,
    requestUpdates: true,
    recommendations: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      const response = await fetch('/api/jury/export-data');
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `SimplyJury_Export_Jury_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Une erreur est survenue lors de l\'export des données. Veuillez réessayer.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Paramètres</h1>
        <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#0d4a70]" />
            <div>
              <h2 className="text-lg font-semibold text-[#0d4a70]">Notifications</h2>
              <p className="text-sm text-gray-600">Choisissez les notifications que vous souhaitez recevoir</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Email Notifications */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200">
            <div className="flex-1">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Notifications par email</h4>
              <p className="text-sm text-gray-600">Recevez des notifications pour les nouveaux messages et mises à jour</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleToggle('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#13d090]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13d090]"></div>
            </label>
          </div>

          {/* New Requests */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200">
            <div className="flex-1">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Nouvelles demandes de mission</h4>
              <p className="text-sm text-gray-600">Notification lorsqu'un centre vous envoie une demande de jury</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.newRequests}
                onChange={() => handleToggle('newRequests')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#13d090]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13d090]"></div>
            </label>
          </div>

          {/* Request Updates */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-200">
            <div className="flex-1">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Mises à jour de missions</h4>
              <p className="text-sm text-gray-600">Notification pour les modifications ou annulations de sessions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.requestUpdates}
                onChange={() => handleToggle('requestUpdates')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#13d090]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13d090]"></div>
            </label>
          </div>

          {/* Recommendations */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Recommandations de missions</h4>
              <p className="text-sm text-gray-600">Recevez des suggestions de missions correspondant à votre profil</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={notifications.recommendations}
                onChange={() => handleToggle('recommendations')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#13d090]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13d090]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#0d4a70]" />
            <div>
              <h2 className="text-lg font-semibold text-[#0d4a70]">Sécurité</h2>
              <p className="text-sm text-gray-600">Gérez la sécurité de votre compte</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Mot de passe</h4>
              <p className="text-sm text-gray-600">Dernière modification : 15 mars 2025</p>
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm w-full sm:w-auto">
              Changer
            </button>
          </div>
        </div>
      </div>

      {/* Visibility Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#0d4a70]" />
            <div>
              <h2 className="text-lg font-semibold text-[#0d4a70]">Visibilité du profil</h2>
              <p className="text-sm text-gray-600">Contrôlez qui peut voir votre profil</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-[#0d4a70] mb-1">Profil visible dans les recherches</h4>
              <p className="text-sm text-gray-600">Les centres de formation peuvent trouver votre profil</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#13d090]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13d090]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Privacy Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#0d4a70]" />
            <div>
              <h2 className="text-lg font-semibold text-[#0d4a70]">Données et confidentialité</h2>
              <p className="text-sm text-gray-600">Gérez vos données personnelles</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  Vos données sont traitées conformément au RGPD. Vous pouvez demander l'export ou la suppression de vos données à tout moment.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Export Data */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h4 className="font-semibold text-[#0d4a70] mb-1">Exporter mes données</h4>
                <p className="text-sm text-gray-600">Téléchargez toutes vos données au format Excel (.xlsx)</p>
              </div>
              <button 
                onClick={handleExportData}
                disabled={isExporting}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                {isExporting ? 'Export en cours...' : 'Exporter'}
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-[#0d4a70] mb-1">Supprimer mon compte</h4>
                <p className="text-sm text-gray-600">Suppression définitive de votre compte et de toutes vos données</p>
              </div>
              <button className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-2 border border-red-200 w-full sm:w-auto justify-center">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
          <button className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto">
            Annuler
          </button>
          <button className="px-6 py-2 bg-[#13d090] text-white font-semibold rounded-lg hover:bg-[#11b87d] transition-colors w-full sm:w-auto">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </section>
  );
}
