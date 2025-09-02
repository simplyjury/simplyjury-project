'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Check } from 'lucide-react';

type AvailabilityPeriod = {
  id: string;
  startDate: string;
  endDate: string;
  modalities: string[];
  note?: string;
};

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (period: Omit<AvailabilityPeriod, 'id'>) => void;
  existingPeriods?: AvailabilityPeriod[];
  editingPeriod?: AvailabilityPeriod | null;
  onUpdate?: (period: AvailabilityPeriod) => void;
}

export function AvailabilityModal({ isOpen, onClose, onSave, existingPeriods = [], editingPeriod, onUpdate }: AvailabilityModalProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    modalities: [] as string[],
    note: ''
  });

  // Initialize form with editing data when modal opens
  React.useEffect(() => {
    if (isOpen && editingPeriod) {
      setFormData({
        startDate: editingPeriod.startDate,
        endDate: editingPeriod.endDate,
        modalities: editingPeriod.modalities,
        note: editingPeriod.note || ''
      });
    } else if (isOpen && !editingPeriod) {
      setFormData({
        startDate: '',
        endDate: '',
        modalities: [],
        note: ''
      });
    }
  }, [isOpen, editingPeriod]);

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Check if a date range overlaps with existing periods (excluding the period being edited)
  const hasOverlap = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return false;
    
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    return existingPeriods.some(period => {
      // Skip the period being edited
      if (editingPeriod && period.id === editingPeriod.id) {
        return false;
      }
      
      const existingStart = new Date(period.startDate);
      const existingEnd = new Date(period.endDate);
      
      // Check if ranges overlap: new period starts before existing ends AND new period ends after existing starts
      return newStart <= existingEnd && newEnd >= existingStart;
    });
  };

  // Get error message for overlap
  const getOverlapError = () => {
    if (!formData.startDate || !formData.endDate) return '';
    
    if (hasOverlap(formData.startDate, formData.endDate)) {
      const conflictingPeriod = existingPeriods.find(period => {
        const existingStart = new Date(period.startDate);
        const existingEnd = new Date(period.endDate);
        const newStart = new Date(formData.startDate);
        const newEnd = new Date(formData.endDate);
        return newStart <= existingEnd && newEnd >= existingStart;
      });
      
      if (conflictingPeriod) {
        const start = new Date(conflictingPeriod.startDate).toLocaleDateString('fr-FR');
        const end = new Date(conflictingPeriod.endDate).toLocaleDateString('fr-FR');
        return `Cette période chevauche avec une période existante (${start} - ${end})`;
      }
    }
    return '';
  };

  const handleModalityToggle = (modality: string) => {
    setFormData(prev => ({
      ...prev,
      modalities: prev.modalities.includes(modality)
        ? prev.modalities.filter(m => m !== modality)
        : [...prev.modalities, modality]
    }));
  };

  const handleSave = () => {
    if (formData.startDate && formData.endDate && formData.modalities.length > 0) {
      // Check for overlaps before saving
      if (hasOverlap(formData.startDate, formData.endDate)) {
        return; // Don't save if there's an overlap
      }
      
      if (editingPeriod && onUpdate) {
        // Update existing period
        onUpdate({
          ...editingPeriod,
          startDate: formData.startDate,
          endDate: formData.endDate,
          modalities: formData.modalities,
          note: formData.note
        });
      } else {
        // Create new period
        onSave({
          startDate: formData.startDate,
          endDate: formData.endDate,
          modalities: formData.modalities,
          note: formData.note
        });
      }
      
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ startDate: '', endDate: '', modalities: [], note: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#0d4a70]">
            {editingPeriod ? 'Modifier la période de disponibilité' : 'Ajouter une période de disponibilité'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-[#0d4a70] mb-2 block">Date de début *</Label>
              <Input
                type="date"
                value={formData.startDate}
                min={getTomorrowDate()}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="border-slate-300 focus:border-[#13d090]"
                required
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-[#0d4a70] mb-2 block">Date de fin *</Label>
              <Input
                type="date"
                value={formData.endDate}
                min={formData.startDate || getTomorrowDate()}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="border-slate-300 focus:border-[#13d090]"
                required
              />
            </div>
          </div>

          {/* Overlap Error Message */}
          {getOverlapError() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{getOverlapError()}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold text-[#0d4a70] mb-3 block">Modalités acceptées pour cette période *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.modalities.includes('presentiel') 
                    ? 'border-[#13d090] bg-green-50/30' 
                    : 'border-slate-300 hover:border-[#13d090] hover:bg-green-50/20'
                }`}
                onClick={() => handleModalityToggle('presentiel')}
              >
                <div className={`w-5 h-5 border-2 rounded ${
                  formData.modalities.includes('presentiel') 
                    ? 'bg-[#13d090] border-[#13d090]' 
                    : 'border-slate-300'
                } flex items-center justify-center`}>
                  {formData.modalities.includes('presentiel') && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-semibold text-[#0d4a70]">Présentiel</span>
              </div>
              <div 
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.modalities.includes('visio') 
                    ? 'border-[#13d090] bg-green-50/30' 
                    : 'border-slate-300 hover:border-[#13d090] hover:bg-green-50/20'
                }`}
                onClick={() => handleModalityToggle('visio')}
              >
                <div className={`w-5 h-5 border-2 rounded ${
                  formData.modalities.includes('visio') 
                    ? 'bg-[#13d090] border-[#13d090]' 
                    : 'border-slate-300'
                } flex items-center justify-center`}>
                  {formData.modalities.includes('visio') && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-semibold text-[#0d4a70]">Visioconférence</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-[#0d4a70] mb-2 block">Note (optionnelle)</Label>
            <Input
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Ex: Préférence matin, région PACA uniquement..."
              className="border-slate-300 focus:border-[#13d090]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#13d090] hover:bg-[#0fb378] text-white"
            disabled={!formData.startDate || !formData.endDate || formData.modalities.length === 0 || hasOverlap(formData.startDate, formData.endDate)}
          >
            <Check className="w-4 h-4 mr-2" />
            {editingPeriod ? 'Modifier cette période' : 'Ajouter cette période'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
