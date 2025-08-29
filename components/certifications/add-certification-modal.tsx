'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';

interface FranceCompetencesCertification {
  code_rncp: string;
  intitule: string;
  niveau_qualification: number;
  date_fin_enregistrement: string;
  date_debut_validite: string;
  domaines_activite: string[];
  specialites_formation: string[];
}

interface AddCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (certification: FranceCompetencesCertification) => void;
}

export function AddCertificationModal({ isOpen, onClose, onAdd }: AddCertificationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FranceCompetencesCertification[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<FranceCompetencesCertification | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock search results for development
  const mockSearchResults: FranceCompetencesCertification[] = [
    {
      code_rncp: "RNCP34826",
      intitule: "Manager opérationnel d'activités",
      niveau_qualification: 6,
      date_fin_enregistrement: "2025-07-19",
      date_debut_validite: "2020-07-19",
      domaines_activite: ["Management", "Commerce"],
      specialites_formation: ["Gestion d'équipe", "Pilotage opérationnel"]
    },
    {
      code_rncp: "RNCP31678",
      intitule: "Concepteur développeur d'applications",
      niveau_qualification: 6,
      date_fin_enregistrement: "2025-11-26",
      date_debut_validite: "2020-11-26",
      domaines_activite: ["Informatique", "Numérique"],
      specialites_formation: ["Développement web", "Applications mobiles"]
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockSearchResults.filter(cert => 
        cert.intitule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.code_rncp.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setShowResults(true);
      setLoading(false);
    }, 500);
  };

  const handleSelectCertification = (certification: FranceCompetencesCertification) => {
    setSelectedCertification(certification);
    setShowResults(false);
  };

  const handleSubmit = () => {
    if (selectedCertification) {
      onAdd(selectedCertification);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCertification(null);
    setShowResults(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0d4a70]">
            Rattacher une certification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search" className="text-sm font-semibold text-[#0d4a70]">
                Rechercher une certification RNCP
              </Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Nom de la certification ou code RNCP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="bg-[#13d090] hover:bg-[#0c9e73]"
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    Aucune certification trouvée
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((cert, index) => (
                      <div
                        key={index}
                        className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectCertification(cert)}
                      >
                        <div className="font-semibold text-[#0d4a70]">{cert.intitule}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          {cert.code_rncp} • Niveau {cert.niveau_qualification}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {cert.domaines_activite.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Certification Details */}
          {selectedCertification && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-[#0d4a70]">Certification sélectionnée</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Code RNCP</Label>
                  <Input value={selectedCertification.code_rncp} readOnly className="mt-1" />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">Niveau de qualification</Label>
                  <Input value={`Niveau ${selectedCertification.niveau_qualification}`} readOnly className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Intitulé de la certification</Label>
                <Input value={selectedCertification.intitule} readOnly className="mt-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Date de début de validité</Label>
                  <Input value={formatDate(selectedCertification.date_debut_validite)} readOnly className="mt-1" />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">Date de fin d'enregistrement</Label>
                  <Input value={formatDate(selectedCertification.date_fin_enregistrement)} readOnly className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Domaines d'activité</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCertification.domaines_activite.map((domaine, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                    >
                      {domaine}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Spécialités de formation</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCertification.specialites_formation.map((specialite, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                    >
                      {specialite}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedCertification}
              className="bg-[#13d090] hover:bg-[#0c9e73]"
            >
              Rattacher la certification
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
