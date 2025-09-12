'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
  action: 'validate' | 'reject';
  userName: string;
  isLoading?: boolean;
}

export function ValidationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  userName,
  isLoading = false
}: ValidationConfirmationModalProps) {
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(comment.trim() || undefined);
    setComment('');
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  const isValidate = action === 'validate';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          {isValidate ? (
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 mr-3" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {isValidate ? 'Valider le profil' : 'Refuser le profil'}
          </h3>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Êtes-vous sûr de vouloir {isValidate ? 'valider' : 'refuser'} le profil de{' '}
            <span className="font-medium text-gray-900">{userName}</span> ?
          </p>
          
          {!isValidate && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Le refus d'un profil est définitif. L'utilisateur devra créer un nouveau compte.
              </p>
            </div>
          )}
        </div>

        {!isValidate && (
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Veuillez expliquer la raison du refus..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent resize-none"
              rows={3}
              required
            />
            {comment.trim().length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                Un commentaire est obligatoire pour le refus
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || (!isValidate && comment.trim().length === 0)}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isValidate
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isValidate ? 'Validation...' : 'Refus...'}
              </div>
            ) : (
              isValidate ? 'Valider' : 'Confirmer le refus'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
