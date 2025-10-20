'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface RNCPInputProps {
  value: string;
  onChange: (value: string, certificationDetails?: CertificationDetails) => void;
  error?: string;
  required?: boolean;
}

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
  romeCodes?: string[];
  romeLabels?: string[];
  warning: string | null;
  replacement?: {
    code: string;
    title: string | null;
  } | null;
}

export default function RNCPInput({ value, onChange, error, required = true }: RNCPInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CertificationDetails | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);

  // Debounce validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue !== value) {
        validateRNCPCode(inputValue);
      }
    }, 800); // Wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [inputValue]);

  const validateRNCPCode = async (code: string) => {
    // Reset states
    setValidationError(null);
    setValidationResult(null);

    // Check format first (client-side)
    const rncpRegex = /^RNCP\d{3,5}$/i;
    if (!rncpRegex.test(code.toUpperCase())) {
      setValidationError('Format invalide. Utilisez le format RNCP suivi de 3 à 5 chiffres (ex: RNCP31114)');
      return;
    }

    // Validate against API
    setIsValidating(true);

    try {
      const response = await fetch(`/api/certifications/validate?code=${code.toUpperCase()}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setValidationResult(data);
        onChange(code.toUpperCase(), data);
      } else {
        setValidationError(data.message || data.error || 'Code RNCP non trouvé');
        onChange(code.toUpperCase());
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError('Erreur lors de la validation. Veuillez réessayer.');
      onChange(code.toUpperCase());
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    
    // Clear validation if input is cleared
    if (!newValue) {
      setValidationResult(null);
      setValidationError(null);
      onChange('');
    }
  };

  const handleBlur = () => {
    if (inputValue && inputValue !== value) {
      validateRNCPCode(inputValue);
    }
  };

  const getInputClassName = () => {
    const baseClasses = 'w-full p-4 border-2 rounded-xl transition-all focus:outline-none focus:ring-3 focus:ring-[#13d090]/10 font-medium uppercase';
    
    if (error || validationError) {
      return `${baseClasses} border-red-500 focus:border-red-500`;
    }
    
    if (validationResult?.valid) {
      return `${baseClasses} border-green-500 focus:border-green-500`;
    }
    
    return `${baseClasses} border-slate-200 focus:border-[#13d090]`;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Ex: RNCP31114"
          pattern="RNCP\d{3,5}"
          required={required}
          className={getInputClassName()}
          maxLength={10}
        />
        
        {/* Validation indicator */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {isValidating && (
            <Loader2 className="w-5 h-5 text-[#13d090] animate-spin" />
          )}
          {!isValidating && validationResult?.valid && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {!isValidating && validationError && (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Validation error */}
      {(error || validationError) && (
        <div className="flex items-start gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error || validationError}</p>
        </div>
      )}

      {/* Certification details */}
      {validationResult?.valid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-900">{validationResult.title}</p>
              <div className="text-sm text-green-700 mt-1 space-y-1">
                <p>Code: {validationResult.code}</p>
                {validationResult.level && (
                  <p>Niveau européen: {validationResult.level}</p>
                )}
                {validationResult.domain && (
                  <p>Domaine: {validationResult.domain}</p>
                )}
                {validationResult.isActive && validationResult.endDate && (
                  <p className="text-green-600 font-medium">
                    ✓ Valide jusqu'au {new Date(validationResult.endDate).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Warning for inactive certifications */}
          {validationResult.warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 font-semibold">{validationResult.warning}</p>
                  {validationResult.endDate && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Date de fin d'enregistrement : {new Date(validationResult.endDate).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Replacement suggestion */}
              {validationResult.replacement && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900 font-semibold mb-1">
                    💡 Certification de remplacement disponible
                  </p>
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">{validationResult.replacement.code}</span>
                    {validationResult.replacement.title && (
                      <span className="block text-xs mt-1">{validationResult.replacement.title}</span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (validationResult.replacement) {
                        setInputValue(validationResult.replacement.code);
                        validateRNCPCode(validationResult.replacement.code);
                      }
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Utiliser ce code à la place →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {!inputValue && !error && (
        <p className="text-sm text-slate-500">
          Saisissez le code RNCP de la certification (ex: RNCP31114, RNCP34838)
        </p>
      )}
    </div>
  );
}
