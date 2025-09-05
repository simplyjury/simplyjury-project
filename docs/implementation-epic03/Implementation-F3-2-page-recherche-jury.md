# Implementation F3-2 : Page Recherche de Jury

## Vue d'ensemble

Cette documentation décrit l'implémentation complète de la page de recherche de jury accessible aux centres de formation. La fonctionnalité permet aux centres de rechercher, filtrer et contacter des jurys validés selon différents critères.

## Architecture Technique

### 1. Structure des Fichiers

```
app/(dashboard)/dashboard/search/page.tsx    # Page principale de recherche
app/api/jury/search/route.ts                 # API endpoint pour la recherche
lib/db/schema.ts                             # Schémas de base de données
```

### 2. Composants Principaux

#### Page de Recherche (`/dashboard/search/page.tsx`)

**Fonctionnalités implémentées :**
- Interface utilisateur responsive basée sur le mockup fourni
- Barre de recherche avec debounce (500ms) pour optimiser les performances
- Filtres avancés (région, domaine d'expertise, modalité, disponibilité)
- Pagination avec contrôles de navigation
- Basculement entre vue liste et grille
- Gestion des états de chargement, erreur et vide
- Affichage des cartes de jury avec informations détaillées

**États React utilisés :**
```typescript
interface SearchFilters {
  query: string;        // Recherche textuelle
  region: string;       // Filtre par région
  certification: string; // Filtre par domaine d'expertise
  modality: string;     // Modalité de travail (visio/présentiel)
  availability: string; // Disponibilité
}
```

#### API Endpoint (`/api/jury/search/route.ts`)

**Fonctionnalités :**
- Recherche full-text dans les noms, expertises, régions et villes
- Filtrage par critères multiples
- Pagination avec limite configurable
- Génération d'URLs signées pour les photos de profil
- Transformation des données pour le frontend
- Gestion des erreurs et validation des paramètres

## Base de Données et Sécurité

### 1. Tables Utilisées

**Table `users` :**
- Stockage des comptes utilisateurs jury
- Champ `user_type = 'jury'`
- Statut de validation (`validation_status = 'validated'`)

**Table `jury_profiles` :**
- Profils détaillés des jurys
- Domaines d'expertise, certifications, expérience
- Préférences de modalités de travail
- Zones d'intervention et tarifs

**Table `french_regions` :**
- Référentiel des 13 régions françaises
- Utilisé pour les filtres de région

### 2. Politiques RLS (Row Level Security)

**Politique pour `jury_profiles` :**
```sql
CREATE POLICY "jury_profiles_center_view" ON public.jury_profiles
FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = current_setting('app.current_user_id')::integer
    AND u.user_type = 'centre'
  )
  AND EXISTS (
    SELECT 1 FROM users u2
    WHERE u2.id = jury_profiles.user_id
    AND u2.validation_status = 'validated'
  )
);
```

**Politique pour `users` (accès aux jurys) :**
```sql
CREATE POLICY "users_center_view_juries" ON public.users
FOR SELECT TO public
USING (
  user_type = 'jury' 
  AND EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = current_setting('app.current_user_id')::integer
    AND u.user_type = 'centre'
  )
);
```

## Gestion des Photos de Profil

### 1. Configuration du Bucket Supabase

**Bucket `profile-pictures` :**
- Configuration : `public: false` (bucket privé)
- Politiques RLS pour contrôler l'accès
- Structure : `jury-profiles/{user_id}-{timestamp}.{extension}`

### 2. Politique RLS pour le Storage

```sql
CREATE POLICY "Training centers can read jury profile pictures" 
ON storage.objects
FOR SELECT TO authenticated
USING (
  (storage.foldername(name))[1] = 'jury-profiles'
  AND ((current_setting('request.jwt.claims', true))::json ->> 'userType') = 'centre'
);
```

### 3. Génération d'URLs Signées

**Implémentation dans l'API :**

```typescript
// Configuration du client Supabase avec service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Génération d'URL signée pour chaque photo
if (jury.profilePhotoUrl) {
  const urlParts = jury.profilePhotoUrl.split('/storage/v1/object/public/profile-pictures/');
  if (urlParts.length > 1) {
    const filePath = urlParts[1];
    const { data } = await supabase.storage
      .from('profile-pictures')
      .createSignedUrl(filePath, 3600); // Expiration : 1 heure
    
    signedPhotoUrl = data?.signedUrl || null;
  }
}
```

**Avantages des URLs signées :**
- Sécurité : Accès temporaire et contrôlé aux fichiers privés
- Performance : Pas de proxy nécessaire côté serveur
- Flexibilité : Expiration configurable (1 heure par défaut)
- Compatibilité : Fonctionne avec les politiques RLS existantes

## Fonctionnalités de Recherche et Filtrage

### 1. Recherche Textuelle

**Implémentation SQL :**
```sql
WHERE (
  LOWER(jury_profiles.first_name || ' ' || jury_profiles.last_name) LIKE LOWER('%' || query || '%')
  OR EXISTS (
    SELECT 1 FROM unnest(jury_profiles.expertise_domains) AS domain
    WHERE LOWER(domain) LIKE LOWER('%' || query || '%')
  )
  OR LOWER(jury_profiles.region) LIKE LOWER('%' || query || '%')
  OR LOWER(jury_profiles.city) LIKE LOWER('%' || query || '%')
)
```

**Champs recherchés :**
- Nom et prénom du jury
- Domaines d'expertise
- Région et ville

### 2. Filtres Disponibles

#### Filtre par Région
- **Source :** Table `french_regions`
- **Options :** 13 régions françaises complètes
- **Implémentation :** Correspondance exacte avec `jury_profiles.region`

#### Filtre par Domaine d'Expertise
- **Source :** Domaines uniques extraits de `jury_profiles.expertise_domains`
- **Options actuelles :**
  - Communication
  - Développement Web
  - Droit
  - Formation
  - Immobilier
  - Management
  - Marketing Digital

#### Filtre par Modalité de Travail
- **Options :**
  - Visio uniquement
  - Présentiel uniquement
  - Les deux modalités
- **Implémentation :** Recherche dans le tableau `work_modalities`

#### Filtre par Disponibilité
- **Basé sur :** Champ JSON `availability_preferences`
- **Logique :** Vérification des périodes de disponibilité actives

### 3. Pagination

**Configuration :**
- Limite par défaut : 10 jurys par page
- Navigation : Précédent/Suivant + numéros de page
- Compteur total : Affiché en temps réel
- Performance : Requête séparée pour le count total

## Interface Utilisateur

### 1. Design et Responsive

**Conformité au mockup :**
- Couleurs de marque : `#0d4a70` (bleu principal), `#13d090` (vert accent)
- Typographie : Plus Jakarta Sans
- Layout responsive avec breakpoints adaptés
- Animations de hover et transitions fluides

### 2. Composants d'Interface

#### Barre de Recherche
```typescript
// Debounce pour optimiser les performances
const debouncedSearch = useCallback(
  debounce((value: string) => {
    handleFilterChange('query', value);
  }, 500),
  []
);
```

#### Cartes de Jury
**Informations affichées :**
- Photo de profil (avec fallback emoji)
- Nom complet et localisation
- Note et nombre d'avis (simulés)
- Domaines d'expertise (badges)
- Modalités de travail
- Statut de disponibilité
- Boutons d'action (Contacter, Voir profil)

#### Filtres Avancés
- Dropdowns avec options dynamiques
- Réinitialisation individuelle possible
- Mise à jour en temps réel des résultats

### 3. États de l'Interface

**État de Chargement :**
- Skeleton loaders pour les cartes
- Indicateur de chargement global

**État d'Erreur :**
- Message d'erreur explicite
- Bouton de retry

**État Vide :**
- Message informatif quand aucun jury ne correspond
- Suggestions pour modifier les filtres

## Données de Test

### 1. Jeux de Données Créés

**22 profils de jury au total :**
- 2 profils existants (Cédric, Sylvester)
- 20 nouveaux profils avec données diversifiées

**Répartition géographique :**
- Couverture des 13 régions françaises
- Villes principales représentées
- Zones d'intervention variées

**Diversité des profils :**
- Expérience : 5 à 25 ans
- Tarifs : 65€ à 140€/heure
- Modalités : Mix visio/présentiel
- Domaines : 7 expertises différentes

### 2. Génération des Comptes

**Comptes utilisateurs :**
- Emails : `cedric.kerbidi+10@gmail.com` à `cedric.kerbidi+29@gmail.com`
- Statut : Tous validés pour les tests
- Hash de mot de passe : Factice pour les comptes de test

## Performance et Optimisations

### 1. Optimisations Base de Données

**Index recommandés :**
```sql
-- Index pour les recherches textuelles
CREATE INDEX idx_jury_profiles_search ON jury_profiles 
USING gin(to_tsvector('french', first_name || ' ' || last_name));

-- Index pour les filtres
CREATE INDEX idx_jury_profiles_region ON jury_profiles(region);
CREATE INDEX idx_jury_profiles_expertise ON jury_profiles 
USING gin(expertise_domains);
```

### 2. Optimisations Frontend

**Debouncing :** Recherche différée de 500ms pour réduire les appels API
**Pagination :** Chargement à la demande pour gérer de gros volumes
**Cache :** URLs signées valides 1 heure pour éviter la régénération

### 3. Sécurité

**Validation des entrées :** Sanitisation des paramètres de recherche
**RLS :** Accès restreint aux jurys validés uniquement
**URLs signées :** Accès temporaire et sécurisé aux fichiers privés
**CORS :** Configuration appropriée pour les appels API

## Tests et Validation

### 1. Tests Fonctionnels

**Scénarios testés :**
- Recherche par nom de jury
- Filtrage par région
- Filtrage par domaine d'expertise
- Combinaison de filtres multiples
- Pagination avec différents volumes
- Affichage des photos de profil

### 2. Tests de Sécurité

**Vérifications :**
- Accès RLS pour les centres uniquement
- Impossibilité d'accéder aux jurys non validés
- URLs signées fonctionnelles et sécurisées
- Validation des paramètres d'entrée

## Évolutions Futures

### 1. Améliorations Possibles

**Fonctionnalités :**
- Recherche géographique par distance
- Filtres avancés (tarifs, disponibilité précise)
- Sauvegarde de recherches favorites
- Notifications de nouveaux jurys

**Performance :**
- Mise en cache des résultats fréquents
- Recherche full-text avec Elasticsearch
- Optimisation des images avec CDN

### 2. Intégrations

**Système de contact :** Intégration avec la messagerie interne
**Calendrier :** Synchronisation avec les disponibilités
**Paiement :** Intégration du système de facturation
**Analytics :** Suivi des recherches et conversions

## Conclusion

L'implémentation de la page de recherche de jury offre une solution complète et sécurisée pour les centres de formation. La combinaison de fonctionnalités de recherche avancées, de filtres dynamiques et de sécurité robuste (RLS + URLs signées) garantit une expérience utilisateur optimale tout en respectant les contraintes de sécurité et de performance.

La solution est extensible et prête pour les évolutions futures du produit SimplyJury.
