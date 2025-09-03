# Profile Components for Role-Based Page Access

## Vue d'ensemble

Ce document décrit l'implémentation des composants de profil spécialisés pour les différents types d'utilisateurs dans SimplyJury. Le système permet d'afficher des layouts différents selon le type d'utilisateur (jury ou centre) tout en conservant les mêmes URLs pour une expérience utilisateur cohérente.

## Architecture du Système

### Principe de Fonctionnement

Le système utilise une approche de **rendu conditionnel** basée sur la détection du type d'utilisateur pour afficher le composant approprié :

1. **Détection du type d'utilisateur** via une logique hiérarchique
2. **Rendu conditionnel** du composant correspondant
3. **Protection des routes** selon les permissions utilisateur
4. **Navigation adaptée** dans la sidebar

### Logique de Détection du Type d'Utilisateur

```typescript
const isJury = searchParams.get('profile') === 'jury' || 
               (juryProfileResponse?.data && !searchParams.get('profile')) ||
               (user?.userType === 'jury' && !searchParams.get('profile'));
```

**Ordre de priorité :**
1. **Paramètre URL** : `?profile=jury` (priorité maximale)
2. **Données de profil** : Existence de données de profil jury
3. **Champ base de données** : `users.user_type` (fallback)

## Composants Créés

### 1. Composants de Profil

#### Jury Profile Component
- **Fichier** : `/components/profile/jury-profile-page.tsx`
- **Usage** : Profil individuel pour les professionnels jurys
- **Fonctionnalités** :
  - Informations personnelles (prénom, nom, région, ville)
  - Expérience professionnelle (années, poste actuel, diplôme principal)
  - Domaines d'expertise et certifications
  - Bio/présentation professionnelle
  - Upload de photo
  - Préférences de disponibilité et modalités de travail
  - Zones d'intervention et tarifs horaires

#### Center Profile Component
- **Fichier** : `/components/profile/center-profile-page.tsx`
- **Usage** : Profil d'entreprise pour les centres de formation
- **Fonctionnalités** :
  - Informations entreprise (nom, SIRET, adresse)
  - Détails de la personne de contact
  - Upload de logo
  - Description de l'activité
  - Statut de certification (isCertificateur, Qualiopi)
  - Région et informations de contact

### 2. Composants de Dashboard

#### Jury Dashboard Components
- **jury-reviews.tsx** : Évaluations reçues des centres
- **jury-settings.tsx** : Paramètres spécifiques aux jurys

#### Center Dashboard Components
- **center-reviews.tsx** : Avis donnés aux jurys
- **center-settings.tsx** : Paramètres spécifiques aux centres

## Pages avec Rendu Conditionnel

### Pages Accessibles aux Deux Types d'Utilisateurs

| Page | Composant Jury | Composant Centre | Navigation |
|------|----------------|------------------|------------|
| `/dashboard` | `JuryDashboard` | `CenterDashboard` | ✅ Les deux sidebars |
| `/dashboard/profile` | `JuryProfilePage` | `CenterProfilePage` | ✅ Les deux sidebars |
| `/dashboard/reviews` | `JuryReviews` | `CenterReviews` | ✅ Les deux sidebars |
| `/dashboard/settings` | `JurySettings` | `CenterSettings` | ✅ Les deux sidebars |

### Exemple d'Implémentation

```typescript
// app/(dashboard)/dashboard/profile/page.tsx
export default function ProfilePage() {
  const searchParams = useSearchParams();
  
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: juryProfileResponse } = useSWR('/api/profile/jury', fetcher);
  
  const isJury = searchParams.get('profile') === 'jury' || 
                 (juryProfileResponse?.data && !searchParams.get('profile')) ||
                 (user?.userType === 'jury' && !searchParams.get('profile'));

  if (isJury) {
    return <JuryProfilePage />;
  }
  
  return <CenterProfilePage />;
}
```

## Protection des Routes

### Pages avec Accès Restreint

#### Page Certifications (Centre Uniquement)
- **Route** : `/dashboard/certifications`
- **Accès** : Centres avec `isCertificateur: true` uniquement
- **Contrôle d'accès** :

```typescript
// Vérification côté client
const authResponse = await fetch('/api/profile/center');
const centerProfile = await authResponse.json();

if (!centerProfile.data?.isCertificateur) {
  setAuthError('Accès non autorisé. Seuls les centres de formation certificateurs peuvent accéder à cette page.');
  return;
}
```

## Navigation Sidebar

### Navigation Adaptée par Type d'Utilisateur

#### Navigation Jury
```typescript
{
  title: 'MON COMPTE',
  items: [
    {
      name: 'Mon profil',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: 'Paramètres',
      href: '/dashboard/settings',
      icon: Settings,
    },
    // ...
  ],
}
```

#### Navigation Centre
```typescript
{
  title: 'MON COMPTE',
  items: [
    {
      name: 'Mon profil',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      name: 'Paramètres',
      href: '/dashboard/settings',
      icon: Settings,
    },
    {
      name: 'Passer au Pro',
      href: '/dashboard/upgrade',
      icon: Crown,
    },
  ],
}
```

### Navigation Conditionnelle pour Certificateurs

```typescript
// Ajout conditionnel de "Mes certifications" pour les centres certificateurs
if (isCertificateur) {
  baseMainNavigation.push({
    name: 'Mes certifications',
    href: '/dashboard/certifications',
    icon: Award,
  });
}
```

## Structure des URLs

### URLs Dashboard
- **Utilisateurs Centre** : `/dashboard` (URL propre)
- **Utilisateurs Jury** : `/dashboard?profile=jury` (avec paramètre)

### URLs Profil
- **Les Deux Types** : `/dashboard/profile` (détection automatique du type)
- **Jury Spécifique** : `/dashboard/profile?profile=jury` (explicite)

## Sécurité et Bonnes Pratiques

### Contrôles d'Accès
- **Détection côté client** : Utilisée uniquement pour l'affichage UI
- **Validation côté serveur** : Les endpoints API doivent valider les permissions indépendamment
- **Principe de sécurité** : Ne jamais se fier uniquement à la détection côté client

### Gestion des Erreurs
```typescript
if (!centerProfile.data?.isCertificateur) {
  setAuthError('Accès non autorisé. Seuls les centres de formation certificateurs peuvent accéder à cette page.');
  setLoading(false);
  return;
}
```

## Avantages de cette Architecture

1. **URLs Cohérentes** : Même URL pour différents types d'utilisateurs
2. **Séparation des Préoccupations** : Composants spécialisés par type d'utilisateur
3. **Maintenabilité** : Logique de détection centralisée et réutilisable
4. **Évolutivité** : Facilité d'ajout de nouveaux types d'utilisateurs
5. **Expérience Utilisateur** : Navigation intuitive et adaptée au contexte

## Prochaines Étapes

1. **Validation Serveur** : Implémenter la validation des permissions côté API
2. **Tests** : Créer des tests pour la logique de détection et le rendu conditionnel
3. **Optimisation** : Mise en cache des données de profil pour améliorer les performances
4. **Monitoring** : Ajouter des logs pour le suivi des accès aux pages protégées

## Fichiers Modifiés

### Composants Créés
- `/components/profile/jury-profile-page.tsx`
- `/components/profile/center-profile-page.tsx`
- `/components/dashboard/jury-reviews.tsx`
- `/components/dashboard/center-reviews.tsx`
- `/components/dashboard/jury-settings.tsx`
- `/components/dashboard/center-settings.tsx`

### Pages Modifiées
- `/app/(dashboard)/dashboard/profile/page.tsx`
- `/app/(dashboard)/dashboard/reviews/page.tsx`
- `/app/(dashboard)/dashboard/settings/page.tsx`
- `/app/(dashboard)/dashboard/certifications/page.tsx`

### Navigation
- `/components/ui/sidebar-navigation.tsx`

Cette architecture garantit une expérience utilisateur personnalisée tout en maintenant la sécurité et la maintenabilité du code.
