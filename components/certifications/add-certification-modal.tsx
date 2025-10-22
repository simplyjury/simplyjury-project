'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  resubmissionMode?: boolean;
  prefilledRncpCode?: string;
}

export function AddCertificationModal({ isOpen, onClose, onAdd, resubmissionMode = false, prefilledRncpCode = '' }: AddCertificationModalProps) {
  const [rncpCode, setRncpCode] = useState('');
  const [certificationDetails, setCertificationDetails] = useState<CertificationDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userSiret, setUserSiret] = useState<string | null>(null);
  const [siretMismatch, setSiretMismatch] = useState(false);
  const [resubmissionComment, setResubmissionComment] = useState('');

  // Fetch user's SIRET and set prefilled code when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserSiret();
      if (resubmissionMode && prefilledRncpCode) {
        setRncpCode(prefilledRncpCode);
        // Trigger validation for prefilled code
        // The RNCPInput component will handle the validation
      }
    }
  }, [isOpen, resubmissionMode, prefilledRncpCode]);

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
    // In resubmission mode, we only need the RNCP code (already validated)
    // In normal mode, we need full certification details validation
    if (!rncpCode) {
      setError('Veuillez saisir un code RNCP valide');
      return;
    }

    if (!resubmissionMode && !certificationDetails?.valid) {
      setError('Veuillez saisir un code RNCP valide');
      return;
    }

    // Validate comment for resubmission mode
    if (resubmissionMode) {
      if (!resubmissionComment.trim()) {
        setError('Le commentaire est obligatoire pour redemander la validation');
        return;
      }
      if (resubmissionComment.trim().length < 10) {
        setError('Le commentaire doit contenir au moins 10 caractères');
        return;
      }
      if (resubmissionComment.trim().length > 150) {
        setError('Le commentaire ne peut pas dépasser 150 caractères');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/certifications/attach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          rncpCode,
          resubmission: resubmissionMode,
          resubmissionComment: resubmissionMode ? resubmissionComment.trim() : undefined
        })
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
    setResubmissionComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0d4a70] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#13d090]" />
            {resubmissionMode ? 'Redemander la validation' : 'Rattacher une certification RNCP'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {resubmissionMode 
              ? 'Ajoutez un commentaire pour expliquer votre demande de réexamen'
              : 'Recherchez et rattachez une certification professionnelle à votre centre de formation'
            }
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
              {resubmissionMode ? (
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                  <p className="text-lg font-semibold text-slate-700">{prefilledRncpCode}</p>
                  <p className="text-xs text-slate-500 mt-1">Ce code ne peut pas être modifié</p>
                </div>
              ) : (
                <RNCPInput
                  value={rncpCode}
                  onChange={handleRNCPChange}
                  required={true}
                />
              )}
            </div>
          )}

          {/* Resubmission Comment Field */}
          {resubmissionMode && !success && (
            <div className="space-y-2">
              <Label className="text-base font-semibold text-[#0d4a70]">
                Commentaire <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={resubmissionComment}
                onChange={(e) => setResubmissionComment(e.target.value)}
                placeholder="Expliquez pourquoi vous redemandez la validation de cette certification (10-150 caractères)..."
                className="min-h-[100px] resize-none"
                maxLength={150}
              />
              <div className="flex justify-between items-center text-xs">
                <span className={`${
                  resubmissionComment.length < 10 
                    ? 'text-red-500' 
                    : resubmissionComment.length > 150 
                    ? 'text-red-500' 
                    : 'text-green-600'
                }`}>
                  {resubmissionComment.length < 10 
                    ? `Minimum 10 caractères (${resubmissionComment.length}/10)` 
                    : 'Commentaire valide'
                  }
                </span>
                <span className={`${
                  resubmissionComment.length > 150 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {resubmissionComment.length}/150
                </span>
              </div>
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
            disabled={
              isSubmitting || 
              success || 
              (resubmissionMode ? (!prefilledRncpCode || resubmissionComment.trim().length < 10 || resubmissionComment.trim().length > 150) : !certificationDetails?.valid)
            }
            className="bg-[#13d090] hover:bg-[#0ea574] text-white min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {resubmissionMode ? 'Envoi...' : 'Rattachement...'}
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {resubmissionMode ? 'Envoyée' : 'Rattachée'}
              </>
            ) : (
              resubmissionMode ? 'Envoyer la demande' : 'Rattacher'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
