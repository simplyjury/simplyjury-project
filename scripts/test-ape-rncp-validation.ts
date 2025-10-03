/**
 * Script de test : Validation APE vs RNCP
 * 
 * Ce script teste la logique de détection d'incohérence entre le code APE
 * d'un centre de formation et les certifications RNCP qu'il souhaite rattacher.
 * 
 * Usage: npx tsx scripts/test-ape-rncp-validation.ts
 */

// Mapping APE → Domaines suggérés
const APE_TO_DOMAINS: Record<string, string[]> = {
  // IT &
