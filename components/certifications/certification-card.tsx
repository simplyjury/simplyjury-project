import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Star, Search, BarChart3, Settings, Clock, AlertTriangle, XCircle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

interface CertificationData {
  id: number;
  title: string;
  code: string;
  level: string;
  domain: string;
  status: 'active' | 'inactive' | 'expired';
  validity_end: string;
  candidates_count: number;
  success_rate: number;
  competency_blocks: string[];
  tags: string[];
  approval_status?: 'approved' | 'pending' | 'rejected';
  siret_mismatch?: boolean;
  certificateur_name?: string;
  certificateur_siret?: string;
  approval_comment?: string;
}

interface CertificationCardProps {
  certification: CertificationData;
  onFindJuries: (id: number) => void;
  onViewStats: (id: number) => void;
  onManage: (id: number) => void;
  onResubmit?: (id: number) => void;
}

export function CertificationCard({ 
  certification, 
  onFindJuries, 
  onViewStats, 
  onManage,
  onResubmit 
}: CertificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDomainIcon = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'management':
        return '🎓';
      case 'informatique':
        return '💻';
      case 'industrie':
        return '🏭';
      case 'commerce':
        return '📈';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalStatusBadge = () => {
    if (certification.approval_status === 'pending') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </Badge>
      );
    }
    if (certification.approval_status === 'rejected') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Rejetée
        </Badge>
      );
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      {/* Collapsed Row - Always Visible */}
      <div 
        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Icon */}
          <button className="flex-shrink-0 text-slate-400 hover:text-slate-600">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          {/* Domain Icon */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
            {getDomainIcon(certification.domain)}
          </div>

          {/* Title and Code */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#0d4a70] truncate">
                {certification.title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {certification.code}
              </Badge>
              {getApprovalStatusBadge()}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-600 flex-shrink-0">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {certification.candidates_count}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {certification.success_rate}%
            </span>
          </div>

          {/* RNCP Status Badge */}
          <Badge className={`${getStatusColor(certification.status)} border flex-shrink-0`}>
            <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
            {certification.status === 'active' ? 'Active' : 
             certification.status === 'inactive' ? 'Inactive' : 'Expirée'}
          </Badge>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-slate-50/50 border-t border-slate-100">
          {/* Approval Status Banners */}
          {certification.approval_status === 'pending' && (
            <div className="mt-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900">
                    En attente d'approbation
                  </p>
                  {certification.siret_mismatch && (
                    <p className="text-xs text-yellow-800 mt-1">
                      Cette certification nécessite une validation administrative en raison d'une non-concordance du SIRET.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {certification.approval_status === 'rejected' && (
            <div className="mt-4 mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">
                    Certification non approuvée
                  </p>
                  {certification.siret_mismatch && (
                    <p className="text-xs text-red-800 mt-1">
                      Le SIRET de votre centre ne correspond pas au SIRET du certificateur enregistré auprès de France Compétences.
                    </p>
                  )}
                  {certification.approval_comment && (
                    <div className="mt-3 p-3 bg-red-100 rounded">
                      <p className="text-xs font-semibold text-red-900 mb-1">Commentaire de l'administrateur :</p>
                      <p className="text-xs text-red-800 italic">{certification.approval_comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Actif jusqu'au {formatDate(certification.validity_end)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" />
                <span>{certification.candidates_count} candidats cette année</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Star className="w-4 h-4" />
                <span>{certification.success_rate}% de réussite</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                  Niveau {certification.level}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                  {certification.domain}
                </Badge>
                {certification.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 border-green-200 text-xs">
                    {tag}
                  </Badge>
                ))}
                {certification.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{certification.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Competency Blocks */}
          {certification.competency_blocks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-[#0d4a70] mb-2">
                Blocs de compétences ({certification.competency_blocks.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {certification.competency_blocks.map((block, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-white text-slate-700 px-2 py-1 rounded border border-slate-200"
                  >
                    {block}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
            {certification.approval_status === 'rejected' ? (
              <Button 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onResubmit?.(certification.id);
                }}
                className="bg-[#13d090] hover:bg-[#0c9e73] text-white"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Redemander la validation
              </Button>
            ) : (
              <>
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFindJuries(certification.id);
                  }}
                  className="bg-[#13d090] hover:bg-[#0c9e73] text-white"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Trouver des jurys
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewStats(certification.id);
                  }}
                  className="border-slate-200 text-[#0d4a70]"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Statistiques
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManage(certification.id);
                  }}
                  className="border-slate-200 text-[#0d4a70]"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Gérer
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
