'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { RomeCode } from '@/lib/utils/rome-extractor';

interface RomeSearchInputProps {
  selectedCodes: RomeCode[];
  onSelect: (code: RomeCode) => void;
  onRemove: (code: string) => void;
  maxSelections?: number;
}

export function RomeSearchInput({
  selectedCodes,
  onSelect,
  onRemove,
  maxSelections = 5
}: RomeSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RomeCode[]>([]);
  const [popularCodes, setPopularCodes] = useState<RomeCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load popular codes on mount
  useEffect(() => {
    fetch('/api/rome/popular?limit=12')
      .then(res => res.json())
      .then(data => setPopularCodes(data.codes || []))
      .catch(err => console.error('Error loading popular codes:', err));
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/rome/search?q=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        setResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching ROME codes:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const canAddMore = selectedCodes.length < maxSelections;

  const handleSelect = (code: RomeCode) => {
    if (!canAddMore) return;
    const isAlreadySelected = selectedCodes.some(c => c.code === code.code);
    if (isAlreadySelected) return;
    
    onSelect(code);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder="Rechercher un métier (ex: coiffeur, développeur, comptable...)"
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#13d090] focus:border-transparent"
          disabled={!canAddMore}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
        )}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery('');
              setShowResults(false);
            }}
            className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg">
          {results.map((code) => {
            const isSelected = selectedCodes.some(c => c.code === code.code);
            return (
              <button
                key={code.code}
                onClick={() => handleSelect(code)}
                disabled={isSelected || !canAddMore}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                  isSelected ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''
                }`}
              >
                <div className="font-medium text-[#0d4a70]">
                  {code.code} - {code.label}
                </div>
                {code.categoryCode && (
                  <div className="text-sm text-gray-500 mt-1">
                    Catégorie: {code.categoryCode}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No Results Message */}
      {showResults && query && !loading && results.length === 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center text-gray-500">
          Aucun métier trouvé pour "{query}"
        </div>
      )}

      {/* Popular Suggestions */}
      {!query && popularCodes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            💡 Métiers populaires :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {popularCodes.map((code) => {
              const isSelected = selectedCodes.some(c => c.code === code.code);
              return (
                <button
                  key={code.code}
                  onClick={() => handleSelect(code)}
                  disabled={isSelected || !canAddMore}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-white border-gray-200 hover:border-[#13d090] hover:bg-[#13d090]/5'
                  }`}
                >
                  <div className="font-medium text-[#0d4a70] truncate">
                    {code.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {code.code}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Codes */}
      {selectedCodes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#0d4a70] mb-2">
            ✅ Domaines sélectionnés ({selectedCodes.length}/{maxSelections}) :
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCodes.map((code) => (
              <span
                key={code.code}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#13d090] text-white rounded-full text-sm"
              >
                <span className="font-medium">{code.code}</span>
                <span>-</span>
                <span>{code.label}</span>
                <button
                  onClick={() => onRemove(code.code)}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                  aria-label={`Retirer ${code.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 Sélectionnez 1 à {maxSelections} codes ROME correspondant à vos domaines d'expertise.
          Ces codes permettront de vous matcher avec les certifications pertinentes.
        </p>
      </div>

      {/* Max Selection Warning */}
      {!canAddMore && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-orange-800">
            ⚠️ Vous avez atteint le nombre maximum de domaines ({maxSelections}).
            Retirez un domaine pour en ajouter un autre.
          </p>
        </div>
      )}
    </div>
  );
}
