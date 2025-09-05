'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, MapPin, Star, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface JuryProfile {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  expertise: string[];
  workModalities: string[];
  status: 'available' | 'busy';
  statusText: string;
  experienceYears?: number;
  currentPosition?: string;
  hourlyRate?: string;
  bio?: string;
  profilePhotoUrl?: string;
  interventionZones?: string[];
}

interface SearchFilters {
  query: string;
  region: string;
  certification: string;
  modality: string;
  availability: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [contactsRemaining, setContactsRemaining] = useState(1);
  const [hasUsedFreeContact, setHasUsedFreeContact] = useState(false);
  const [juries, setJuries] = useState<JuryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    region: '',
    certification: '',
    modality: '',
    availability: ''
  });

  // Fetch jury data from API
  const fetchJuries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.query && { q: filters.query }),
        ...(filters.region && { region: filters.region }),
        ...(filters.certification && { certification: filters.certification }),
        ...(filters.modality && { modality: filters.modality }),
        ...(filters.availability && { availability: filters.availability })
      });

      const response = await fetch(`/api/jury/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jury profiles');
      }

      const data = await response.json();
      
      if (data.success) {
        setJuries(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } else {
        throw new Error(data.error || 'Failed to fetch jury profiles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setJuries([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data on component mount and when filters change
  useEffect(() => {
    fetchJuries();
  }, [currentPage, filters]);

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchQuery }));
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleContact = () => {
    if (!hasUsedFreeContact && contactsRemaining > 0) {
      setHasUsedFreeContact(true);
      setContactsRemaining(0);
      alert('Contact envoyé ! Vous avez utilisé votre mise en relation gratuite.');
    } else {
      alert('Limite freemium atteinte. Passez au plan Pro pour plus de contacts.');
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  const JuryCard = ({ jury }: { jury: JuryProfile }) => (
    <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-0 hover:border-l-4 hover:border-l-[#13d090] group">
      <div className={`${viewMode === 'list' ? 'grid grid-cols-[auto_1fr_auto_auto] gap-5 items-center' : 'space-y-4'}`}>
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          {jury.profilePhotoUrl ? (
            <img 
              src={jury.profilePhotoUrl} 
              alt={jury.name}
              className="w-14 h-14 rounded-xl object-cover border-3 border-white shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#bea1e5] to-[#cfbaed] flex items-center justify-center text-xl border-3 border-white shadow-lg">
              {jury.avatar}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-[#0d4a70] mb-1">{jury.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              {jury.location}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#fdce0f] text-sm font-semibold">
                {renderStars(jury.rating)}
              </span>
              <span className="text-xs text-gray-500">
                {jury.rating} ({jury.reviewCount} avis)
              </span>
            </div>
          </div>
        </div>

        {/* Expertise Tags */}
        <div className={`${viewMode === 'grid' ? 'mt-4' : ''}`}>
          <div className="flex flex-wrap gap-2">
            {jury.expertise.map((tag: string, index: number) => (
              <Badge 
                key={index}
                variant="secondary"
                className="bg-[#13d090]/10 text-[#0d4a70] border border-[#13d090]/20 hover:bg-[#13d090]/20 text-xs font-medium px-2.5 py-1"
              >
                {tag}
              </Badge>
            ))}
            {jury.workModalities?.map((modality: string, index: number) => (
              <Badge 
                key={`modality-${index}`}
                variant="outline"
                className="text-xs font-medium px-2.5 py-1"
              >
                {modality === 'presentiel' ? 'Présentiel' : modality === 'visio' ? 'Visio' : modality}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className={`${viewMode === 'grid' ? 'mt-4' : ''}`}>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            jury.status === 'available' 
              ? 'bg-[#13d090]/10 text-[#0d7a5a] border border-[#13d090]/20' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              jury.status === 'available' ? 'bg-[#13d090]' : 'bg-red-500'
            }`} />
            {jury.statusText}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex ${viewMode === 'grid' ? 'w-full mt-4' : 'flex-col'} gap-2 min-w-[120px]`}>
          <Button
            onClick={handleContact}
            disabled={hasUsedFreeContact}
            className={`${viewMode === 'grid' ? 'flex-1' : ''} ${
              hasUsedFreeContact 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200' 
                : 'bg-[#f8fafc] text-[#0d4a70] border border-[#e2e8f0] hover:bg-[#0d4a70] hover:text-white'
            } font-semibold text-sm transition-all`}
            variant="outline"
          >
            {hasUsedFreeContact ? 'Limite atteinte' : 'Contacter'}
          </Button>
          <Button
            variant="ghost"
            className={`${viewMode === 'grid' ? 'flex-1' : ''} text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm`}
          >
            Voir profil
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Search Section */}
      <Card className="p-6 mb-8 border border-[#13d090]/10">
        <div className="space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, expertise ou région..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-4 text-base bg-[#f8fafc] border-2 border-[#e2e8f0] focus:border-[#13d090] focus:bg-white transition-all"
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtres avancés
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#e2e8f0]">
              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                  Certification/Domaine
                </label>
                <select 
                  className="w-full p-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white focus:border-[#13d090] focus:outline-none"
                  value={filters.certification}
                  onChange={(e) => handleFilterChange('certification', e.target.value)}
                >
                  <option value="">Toutes les certifications</option>
                  <option value="Communication">Communication</option>
                  <option value="Développement Web">Développement Web</option>
                  <option value="Droit">Droit</option>
                  <option value="Formation">Formation</option>
                  <option value="Immobilier">Immobilier</option>
                  <option value="Management">Management</option>
                  <option value="Marketing Digital">Marketing Digital</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                  Région
                </label>
                <select 
                  className="w-full p-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white focus:border-[#13d090] focus:outline-none"
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                >
                  <option value="">Toutes les régions</option>
                  <option value="Auvergne-Rhône-Alpes">Auvergne-Rhône-Alpes</option>
                  <option value="Bourgogne-Franche-Comté">Bourgogne-Franche-Comté</option>
                  <option value="Bretagne">Bretagne</option>
                  <option value="Centre-Val de Loire">Centre-Val de Loire</option>
                  <option value="Corse">Corse</option>
                  <option value="Grand Est">Grand Est</option>
                  <option value="Hauts-de-France">Hauts-de-France</option>
                  <option value="Île-de-France">Île-de-France</option>
                  <option value="Normandie">Normandie</option>
                  <option value="Nouvelle-Aquitaine">Nouvelle-Aquitaine</option>
                  <option value="Occitanie">Occitanie</option>
                  <option value="Pays de la Loire">Pays de la Loire</option>
                  <option value="Provence-Alpes-Côte d'Azur">Provence-Alpes-Côte d'Azur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                  Modalités
                </label>
                <select 
                  className="w-full p-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white focus:border-[#13d090] focus:outline-none"
                  value={filters.modality}
                  onChange={(e) => handleFilterChange('modality', e.target.value)}
                >
                  <option value="">Toutes les modalités</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="visio">Visioconférence</option>
                  <option value="hybride">Hybride</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d4a70] mb-2">
                  Disponibilités
                </label>
                <select 
                  className="w-full p-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-white focus:border-[#13d090] focus:outline-none"
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                >
                  <option value="">Toutes</option>
                  <option value="immediate">Immédiate</option>
                  <option value="planifiee">Planifiée</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600 font-medium">
          {loading ? 'Chargement...' : `${totalCount} jurys trouvés`}
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-[#13d090] text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-[#13d090] text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Chargement des jurys...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Erreur: {error}</div>
          <Button onClick={fetchJuries} variant="outline">
            Réessayer
          </Button>
        </div>
      ) : juries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Aucun jury trouvé</div>
          <div className="text-sm text-gray-400">
            Essayez de modifier vos critères de recherche
          </div>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' 
            : 'space-y-4'
        }`}>
          {juries.map((jury: JuryProfile) => (
            <JuryCard key={jury.id} jury={jury} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && juries.length > 0 && (
        <Card className="mt-8 p-5">
          <div className="flex justify-center items-center gap-4">
            <Button 
              variant="outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className={currentPage === 1 ? "text-gray-400" : "text-[#0d4a70] border-[#0d4a70] hover:bg-[#0d4a70] hover:text-white"}
            >
              « Précédent
            </Button>
            <span className="text-gray-600 font-medium">
              Page {currentPage} sur {totalPages}
            </span>
            <Button 
              variant="outline" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className={currentPage === totalPages ? "text-gray-400" : "text-[#0d4a70] border-[#0d4a70] hover:bg-[#0d4a70] hover:text-white"}
            >
              Suivant »
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
