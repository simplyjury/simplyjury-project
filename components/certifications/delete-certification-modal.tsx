import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  certificationTitle: string;
  certificationCode: string;
  isDeleting?: boolean;
}

export function DeleteCertificationModal({
  isOpen,
  onClose,
  onConfirm,
  certificationTitle,
  certificationCode,
  isDeleting = false,
}: DeleteCertificationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Supprimer la certification
            </DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-600 pt-2">
            Êtes-vous sûr de vouloir supprimer cette certification ?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <p className="text-sm font-semibold text-red-900 mb-1">
            {certificationTitle}
          </p>
          <p className="text-xs text-red-700">
            Code RNCP : {certificationCode}
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <p className="text-sm text-yellow-900">
            <strong>Attention :</strong> Cette action est irréversible. Toutes les statistiques associées à cette certification seront également supprimées.
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
