import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Star, Search, BarChart3, Settings } from 'lucide-react';

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
}

interface CertificationCardProps {
  certification: CertificationData;
  onFindJuries: (id: number) => void;
  onViewStats: (id: number) => void;
  onManage: (id: number) => void;
}

export function CertificationCard({ 
  certification, 
  onFindJuries, 
  onViewStats, 
  onManage 
}: CertificationCardProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      {/* Main Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {getDomainIcon(certification.domain)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#0d4a70] mb-1">
            {certification.title}
          </h3>
          <Badge variant="secondary" className="text-xs mb-2">
            {certification.code}
          </Badge>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Actif jusqu'au {formatDate(certification.validity_end)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {certification.candidates_count} candidats cette année
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {certification.success_rate}% de réussite
            </span>
          </div>
        </div>

        <Badge className={`${getStatusColor(certification.status)} border`}>
          <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
          {certification.status === 'active' ? 'Active' : 
           certification.status === 'inactive' ? 'Inactive' : 'Expirée'}
        </Badge>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Niveau {certification.level}
        </Badge>
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          {certification.domain}
        </Badge>
        {certification.tags.map((tag, index) => (
          <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Competency Blocks */}
      <div className="border-t border-slate-100 pt-4 mb-4">
        <h4 className="text-sm font-semibold text-[#0d4a70] mb-2">
          Blocs de compétences ({certification.competency_blocks.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {certification.competency_blocks.map((block, index) => (
            <span 
              key={index}
              className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
            >
              {block}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          size="sm"
          onClick={() => onFindJuries(certification.id)}
          className="bg-[#13d090] hover:bg-[#0c9e73] text-white"
        >
          <Search className="w-4 h-4 mr-1" />
          Trouver des jurys
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onViewStats(certification.id)}
          className="border-slate-200 text-[#0d4a70]"
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          Statistiques
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onManage(certification.id)}
          className="border-slate-200 text-[#0d4a70]"
        >
          <Settings className="w-4 h-4 mr-1" />
          Gérer
        </Button>
      </div>
    </div>
  );
}
