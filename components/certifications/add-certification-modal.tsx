'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle, Info, Sparkles, AlertTriangle } from 'lucide-react';
import RNCPInput from '@/components/ui/rncp-input';

interface CertificationDetails {
  valid: boolean;
  code: string;
  title: string;
  level: string | null;
  domain: string | null;
  isActive: boolean;
  endDate: string | null;
  certificateurs?: Array<{
    siret: string;
    nom: string;
  }>;
  warning: string | null;
  replacement?: {
    code: string;
    title: string | null;
  } | null;
}

interface AddCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export function AddCertificationModal({ isOpen, onClose, onAdd }: AddCertificationModalProps) {
  const [rncpCode, setRncpCode] = useState('');
  const [certificationDetails, setCertificationDetails] = useState<CertificationDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userSiret, setUserSiret] = useState<string | null>(null);
  const [siretMismatch, setSiretMismatch] = useState(false);

  // Fetch user's SIRET when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserSiret();
    }
  }, [isOpen]);

  const fetchUserSiret = async () => {
    try {
      const response = await fetch('/api/profile/center');
      if (response.ok) {
        const result = await response.json();
        setUserSiret(result.data?.siret || null);
      }
    } catch (err) {
      console.error('Error fetching user SIRET:', err);
    }
  };

  const handleRNCPChange = (code: string, details?: CertificationDetails) => {
    setRncpCode(code);
    setCertificationDetails(details || null);
    setError(null);
    
    // Check SIRET mismatch
    if (details?.certificateurs && details.certificateurs.length > 0 && userSiret) {
      const certSirets = details.certificateurs.map(c => c.siret);
      const matches = certSirets.includes(userSiret);
      setSiretMismatch(!matches);
    } else {
      setSiretMismatch(false);
    }
  };

  const handleSubmit = async () => {
    if (!rncpCode || !certificationDetails?.valid) {
      setError('Veuillez saisir un code RNCP valide');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/certifications/attach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rncpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du rattachement');
      }

      setSuccess(true);
      
      // Show appropriate message based on approval status
      if (data.certification?.siretMismatch) {
        // Wait longer to show the pending approval message
        setTimeout(() => {
          onAdd();
          handleClose();
        }, 3000);
      } else {
        // Standard success flow
        setTimeout(() => {
          onAdd();
          handleClose();
        }, 1500);
      }

    } catch (err) {
      console.error('Error attaching certification:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRncpCode('');
    setCertificationDetails(null);
    setError(null);
    setSuccess(false);
    setSiretMismatch(false);
    setUserSiret(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0d4a70] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#13d090]" />
            Rattacher une certification RNCP
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Recherchez et rattachez une certification professionnelle à votre centre de formation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Certification rattachée avec succès !</p>
                <p className="text-sm text-green-700">La certification a été ajoutée à votre liste.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Erreur</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!success && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Comment rattacher une certification ?</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Saisissez le code RNCP de la certification (ex: RNCP31114)</li>
                  <li>Vérifiez les informations affichées</li>
                  <li>Cliquez sur "Rattacher" pour l'ajouter à votre centre</li>
                </ol>
              </div>
            </div>
          )}

          {/* RNCP Input */}
          {!success && (
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#0d4a70]">
                Code RNCP de la certification <span className="text-red-500">*</span>
              </Label>
              <RNCPInput
                value={rncpCode}
                onChange={handleRNCPChange}
                required={true}
              />
            </div>
          )}

          {/* SIRET Mismatch Warning */}
          {siretMismatch && certificationDetails?.certificateurs && !success && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 text-lg mb-2">
                    ⚠️ Attention : SIRET non concordant
                  </h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    Le SIRET de votre centre ne correspond pas au certificateur de cette certification.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white/70 rounded-lg p-3">
                      <p className="text-yellow-700 font-medium mb-1">Certificateur(s) de cette certification :</p>
                      {certificationDetails.certificateurs.map((cert, idx) => (
                        <div key={idx} className="text-yellow-900 mt-1">
                          <p className="font-semibold">{cert.nom}</p>
                          <p className="text-xs">SIRET: {cert.siret}</p>
                        </div>
                      ))}
                    </div>
                    {userSiret && (
                      <div className="bg-white/70 rounded-lg p-3">
                        <p className="text-yellow-700 font-medium">Votre SIRET :</p>
                        <p className="text-yellow-900 font-semibold">{userSiret}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-yellow-700 mt-3 italic">
                    Vous pouvez toujours rattacher cette certification, mais assurez-vous d'avoir les droits nécessaires.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info for Active Certifications */}
          {certificationDetails?.valid && certificationDetails.isActive && !success && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 text-lg mb-2">
                    Certification active et valide
                  </h4>
                  <p className="text-sm text-green-800 mb-3">
                    Cette certification est actuellement active et peut être rattachée à votre centre.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-green-700 font-medium">Code RNCP</p>
                      <p className="text-green-900 font-semibold">{certificationDetails.code}</p>
                    </div>
                    {certificationDetails.level && (
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-green-700 font-medium">Niveau européen</p>
                        <p className="text-green-900 font-semibold">Niveau {certificationDetails.level}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-slate-300"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!certificationDetails?.valid || isSubmitting || success}
            className="bg-[#13d090] hover:bg-[#0ea574] text-white min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rattachement...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Rattachée
              </>
            ) : (
              'Rattacher'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
