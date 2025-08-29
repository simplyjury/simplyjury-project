'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Search, Calendar, Users, Star, Settings, BarChart3, AlertTriangle } from 'lucide-react';
import { CertificationCard } from '@/components/certifications/certification-card';
import { AddCertificationModal } from '@/components/certifications/add-certification-modal';
import { CertificationStats } from '@/components/certifications/certification-stats';

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

interface StatsData {
  active_count: number;
  total_count: number;
  total_candidates: number;
  average_success_rate: number;
}

export default function CertificationsPage() {
  const router = useRouter();
  const [certifications, setCertifications] = useState<CertificationData[]>([]);
  const [stats, setStats] = useState<StatsData>({
    active_count: 0,
    total_count: 0,
    total_candidates: 0,
    average_success_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    level: '',
    domain: ''
  });

  // Check authorization and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Check if user is authorized to access certifications
        const authResponse = await fetch('/api/profile/center');
        if (!authResponse.ok) {
          setAuthError('Erreur d\'authentification');
          setLoading(false);
          return;
        }

        const centerProfile = await authResponse.json();
        
        // Check if the training center is a certificateur
        if (!centerProfile.data?.isCertificateur) {
          setAuthError('Accès non autorisé. Seuls les centres de formation certificateurs peuvent accéder à cette page.');
          setLoading(false);
          return;
        }

        // If authorized, load mock data (replace with real API calls later)
        const mockCertifications: CertificationData[] = [
      {
        id: 1,
        title: "Manager opérationnel d'activités",
        code: "RNCP34826",
        level: "6",
        domain: "Management",
        status: "active",
        validity_end: "2025-07-19",
        candidates_count: 45,
        success_rate: 92,
        competency_blocks: ["Pilotage opérationnel", "Management d'équipe", "Gestion budgétaire", "Communication"],
        tags: ["Management", "Commerce", "Gestion"]
      },
      {
        id: 2,
        title: "Concepteur développeur d'applications",
        code: "RNCP31678",
        level: "6",
        domain: "Informatique",
        status: "active",
        validity_end: "2025-11-26",
        candidates_count: 23,
        success_rate: 87,
        competency_blocks: ["Conception d'applications", "Développement avancé", "Déploiement d'applications"],
        tags: ["Informatique", "Développement", "Web"]
      },
      {
        id: 3,
        title: "Responsable de production industrielle",
        code: "RNCP35506",
        level: "6",
        domain: "Industrie",
        status: "active",
        validity_end: "2025-12-18",
        candidates_count: 31,
        success_rate: 94,
        competency_blocks: ["Planification production", "Management équipes", "Contrôle qualité", "Amélioration continue", "Sécurité industrielle"],
        tags: ["Industrie", "Production", "Qualité"]
      },
      {
        id: 4,
        title: "Responsable de production industrielle",
        code: "RNCP35506",
        level: "6",
        domain: "Industrie",
        status: "active",
        validity_end: "2025-12-18",
        candidates_count: 31,
        success_rate: 94,
        competency_blocks: ["Planification production", "Management équipes", "Contrôle qualité", "Amélioration continue", "Sécurité industrielle"],
        tags: ["Industrie", "Production", "Qualité"]
      }
    ];

    const mockStats: StatsData = {
      active_count: 8,
      total_count: 12,
      total_candidates: 247,
      average_success_rate: 89
    };

    setCertifications(mockCertifications);
    setStats(mockStats);
    setLoading(false);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setAuthError('Erreur lors de la vérification des autorisations');
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, []);

  const filteredCertifications = certifications.filter(cert => {
    if (filters.search && !cert.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !cert.code.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && cert.status !== filters.status) return false;
    if (filters.level && filters.level !== 'all' && cert.level !== filters.level) return false;
    if (filters.domain && filters.domain !== 'all' && cert.domain !== filters.domain) return false;
    return true;
  });

  const handleFindJuries = (certificationId: number) => {
    // Navigate to jury search with certification filter
    console.log('Finding juries for certification:', certificationId);
  };

  const handleViewStats = (certificationId: number) => {
    // Open statistics modal
    console.log('Viewing stats for certification:', certificationId);
  };

  const handleManage = (certificationId: number) => {
    // Open management options
    console.log('Managing certification:', certificationId);
  };

  const handleExport = () => {
    // Export certifications to CSV
    console.log('Exporting certifications');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
            <p className="text-gray-600 mb-6">{authError}</p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-[#0d4a70] hover:bg-[#0c608a] text-white"
            >
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Statistics Cards */}
      <CertificationStats stats={stats} loading={loading} />

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-[#0d4a70]">Mes certifications</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Gérez vos certifications RNCP et trouvez des jurys qualifiés
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#13d090] hover:bg-[#0ea574] text-white text-sm sm:text-base"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Rattacher une certification</span>
                <span className="sm:hidden">Rattacher</span>
              </Button>
              <Button variant="outline" className="border-[#0d4a70] text-[#0d4a70] hover:bg-[#0d4a70] hover:text-white text-sm sm:text-base" size="sm">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exporter la liste</span>
                <span className="sm:hidden">Exporter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom ou code RNCP..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.status || undefined} onValueChange={(value) => setFilters({ ...filters, status: value || '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
                <SelectItem value="expired">Expirées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.level || undefined} onValueChange={(value) => setFilters({ ...filters, level: value || '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les niveaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="3">Niveau 3 (CAP)</SelectItem>
                <SelectItem value="4">Niveau 4 (BAC)</SelectItem>
                <SelectItem value="5">Niveau 5 (BTS)</SelectItem>
                <SelectItem value="6">Niveau 6 (Licence)</SelectItem>
                <SelectItem value="7">Niveau 7 (Master)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.domain || undefined} onValueChange={(value) => setFilters({ ...filters, domain: value || '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les domaines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                <SelectItem value="Informatique">Informatique</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Commerce">Commerce</SelectItem>
                <SelectItem value="Industrie">Industrie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certifications List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#0d4a70]">Vos certifications</CardTitle>
          <span className="text-slate-600 text-sm">
            {filteredCertifications.length} certification{filteredCertifications.length !== 1 ? 's' : ''} trouvée{filteredCertifications.length !== 1 ? 's' : ''}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCertifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Aucune certification trouvée avec ces filtres.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCertifications.map((certification) => (
                <CertificationCard
                  key={certification.id}
                  certification={certification}
                  onFindJuries={handleFindJuries}
                  onViewStats={handleViewStats}
                  onManage={handleManage}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Certification Modal */}
      <AddCertificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(certification) => {
          // Handle adding new certification
          console.log('Adding certification:', certification);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
