# Implementation F2-15: Gestion CRUD des logos pour les centres de formation

## Vue d'ensemble

Cette documentation décrit l'implémentation complète du système de gestion des logos pour les centres de formation, incluant le stockage sécurisé dans Supabase Storage, les politiques RLS, les endpoints API, et l'interface utilisateur.

## 1. Modifications de la base de données

### Nouveau champ ajouté à la table `training_centers`

```sql
-- Migration Supabase
ALTER TABLE training_centers ADD COLUMN logo_url TEXT;
```

### Schéma mis à jour

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `logo_url` | TEXT | **[NOUVEAU]** URL du logo du centre | Non |

### Mise à jour du schéma Drizzle ORM

**Fichier :** `lib/db/schema.ts`

```typescript
export const trainingCenters = pgTable('training_centers', {
  // ... champs existants
  logoUrl: text('logo_url'),
  // ... autres champs
});
```

## 2. Configuration Supabase Storage

### Bucket créé

- **Nom du bucket :** `logo-centres`
- **Type :** Privé (avec RLS activé)
- **Utilisation :** Stockage des logos des centres de formation

### Hiérarchie des fichiers

```
logo-centres/
├── {training_center_id}/
│   └── logo.{extension}
```

**Exemple :**
```
logo-centres/
├── 1/logo.jpg    (Logo du centre ID 1)
├── 2/logo.png    (Logo du centre ID 2)
└── 3/logo.webp   (Logo du centre ID 3)
```

## 3. Politiques RLS (Row Level Security)

### Configuration des politiques sur `storage.objects`

Quatre politiques ont été créées pour sécuriser l'accès aux logos :

#### 1. Politique SELECT (Visualisation)
```sql
-- Nom: "Training centers can view own logos"
-- Opération: SELECT
-- Rôles cibles: authenticated

bucket_id = 'logo-centres' AND
(storage.foldername(name))[1] = (
  SELECT tc.id::text 
  FROM training_centers tc 
  JOIN users u ON tc.user_id = u.id
  WHERE u.email = auth.email()
)
```

#### 2. Politique INSERT (Upload)
```sql
-- Nom: "Training centers can upload own logos"
-- Opération: INSERT
-- Rôles cibles: authenticated

bucket_id = 'logo-centres' AND
(storage.foldername(name))[1] = (
  SELECT tc.id::text 
  FROM training_centers tc 
  JOIN users u ON tc.user_id = u.id
  WHERE u.email = auth.email()
)
```

#### 3. Politique UPDATE (Remplacement)
```sql
-- Nom: "Training centers can update own logos"
-- Opération: UPDATE
-- Rôles cibles: authenticated
-- USING et WITH CHECK (même expression)

bucket_id = 'logo-centres' AND
(storage.foldername(name))[1] = (
  SELECT tc.id::text 
  FROM training_centers tc 
  JOIN users u ON tc.user_id = u.id
  WHERE u.email = auth.email()
)
```

#### 4. Politique DELETE (Suppression)
```sql
-- Nom: "Training centers can delete own logos"
-- Opération: DELETE
-- Rôles cibles: authenticated

bucket_id = 'logo-centres' AND
(storage.foldername(name))[1] = (
  SELECT tc.id::text 
  FROM training_centers tc 
  JOIN users u ON tc.user_id = u.id
  WHERE u.email = auth.email()
)
```

### Principe de sécurité

- **Isolation par dossier :** Chaque centre a son propre dossier nommé d'après son ID
- **Authentification requise :** Toutes les opérations nécessitent une authentification
- **Vérification d'appartenance :** Les politiques vérifient que l'utilisateur authentifié correspond bien au propriétaire du centre

## 4. Endpoints API créés

### 4.1 Upload de logo

**Endpoint :** `POST /api/upload/center-logo`

**Fonctionnalités :**
- Validation du type de fichier (images uniquement)
- Validation de la taille (5MB maximum)
- Upload vers le bucket `logo-centres` avec la hiérarchie appropriée
- Retour de l'URL publique pour stockage en base

**Exemple de réponse :**
```json
{
  "success": true,
  "url": "https://[...].supabase.co/storage/v1/object/public/logo-centres/1/logo.jpg",
  "path": "1/logo.jpg"
}
```

### 4.2 Récupération d'URL signée

**Endpoint :** `GET /api/profile/center/logo-url`

**Fonctionnalités :**
- Génération d'URL signée pour accès sécurisé (1h de validité)
- Fallback vers URL publique si la génération d'URL signée échoue
- Vérification que le logo appartient bien au centre authentifié

**Exemple de réponse :**
```json
{
  "success": true,
  "url": "https://[...].supabase.co/storage/v1/object/sign/logo-centres/1/logo.jpg?token=[...]"
}
```

### 4.3 Suppression de logo

**Endpoint :** `DELETE /api/upload/center-logo/delete`

**Fonctionnalités :**
- Suppression physique du fichier dans le bucket Supabase Storage
- Mise à jour de la base de données (`logo_url = null`)
- Vérification d'appartenance avant suppression

**Exemple de réponse :**
```json
{
  "success": true,
  "message": "Logo supprimé avec succès"
}
```

## 5. Interface utilisateur

### Composant frontend

**Fichier :** `components/profile/center-profile-page.tsx`

### Fonctionnalités implémentées

#### 5.1 Affichage du logo
- Affichage du logo si disponible
- Fallback vers initiales du centre si pas de logo
- Gestion des erreurs de chargement d'image

#### 5.2 Upload de logo
- Sélection de fichier avec validation côté client
- Indicateur de progression pendant l'upload
- Mise à jour automatique de l'affichage après upload
- Sauvegarde automatique de l'URL en base de données

#### 5.3 Suppression de logo
- Confirmation avant suppression
- Suppression complète (fichier + base de données)
- Mise à jour de l'interface après suppression

### Code d'exemple - Upload

```typescript
const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validations
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner un fichier image');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Le fichier ne doit pas dépasser 5MB');
    return;
  }

  // Upload
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/center-logo', {
    method: 'POST',
    body: formData,
  });
  
  const result = await response.json();
  
  // Mise à jour du profil
  await fetch('/api/profile/center', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logoUrl: result.url }),
  });
};
```

### Code d'exemple - Suppression

```typescript
const handleDeleteLogo = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer votre logo ?')) return;
  
  const response = await fetch('/api/upload/center-logo/delete', {
    method: 'DELETE',
  });
  
  if (response.ok) {
    // Mise à jour de l'interface
    mutate();
    setSignedLogoUrl(null);
  }
};
```

## 6. Sécurité et bonnes pratiques

### 6.1 Sécurité des accès
- **RLS activé :** Toutes les opérations sont soumises aux politiques RLS
- **Authentification requise :** Impossible d'accéder aux logos sans authentification
- **Isolation des données :** Chaque centre ne peut accéder qu'à ses propres logos

### 6.2 Validation des fichiers
- **Types autorisés :** Images uniquement (JPG, PNG, WebP, GIF)
- **Taille maximale :** 5MB par fichier
- **Validation côté client et serveur**

### 6.3 Gestion des erreurs
- **Gestion d'erreurs complète** dans tous les endpoints
- **Messages d'erreur explicites** pour l'utilisateur
- **Logging des erreurs** pour le debugging

## 7. Architecture technique

### 7.1 Flow d'upload
1. **Sélection fichier** → Validation côté client
2. **Upload vers API** → Validation serveur + stockage Supabase
3. **Retour URL** → Mise à jour base de données
4. **Affichage logo** → Interface mise à jour

### 7.2 Flow de suppression
1. **Confirmation utilisateur** → Dialog de confirmation
2. **Appel API DELETE** → Suppression fichier + base de données
3. **Interface mise à jour** → Logo retiré de l'affichage

### 7.3 Sécurité des URLs
- **URLs signées** pour l'accès sécurisé (1h de validité)
- **Fallback URLs publiques** si génération d'URL signée échoue
- **Régénération automatique** des URLs expirées

## 8. Tests et validation

### 8.1 Scénarios de test recommandés

1. **Upload de logo**
   - Upload d'image valide → Succès
   - Upload de fichier non-image → Erreur
   - Upload de fichier trop volumineux → Erreur

2. **Affichage de logo**
   - Logo existant → Affichage correct
   - Pas de logo → Affichage des initiales
   - Erreur de chargement → Fallback vers initiales

3. **Suppression de logo**
   - Suppression avec confirmation → Succès
   - Annulation de suppression → Pas de changement
   - Vérification suppression physique → Fichier supprimé du bucket

4. **Sécurité**
   - Tentative d'accès au logo d'un autre centre → Erreur 403
   - Upload sans authentification → Erreur 401

### 8.2 Points de validation

- ✅ **Base de données :** Champ `logo_url` correctement mis à jour
- ✅ **Stockage :** Fichier présent dans le bon dossier du bucket
- ✅ **Sécurité :** RLS policies fonctionnelles
- ✅ **Interface :** Affichage et interactions correctes
- ✅ **Suppression :** Fichier et URL supprimés complètement

## 9. Maintenance et évolutions futures

### 9.1 Points d'attention
- **Monitoring de l'espace de stockage** utilisé par le bucket
- **Nettoyage périodique** des fichiers orphelins (si nécessaire)
- **Optimisation des images** (compression, redimensionnement)

### 9.2 Évolutions possibles
- **Redimensionnement automatique** des images uploadées
- **Support de formats additionnels** (SVG, etc.)
- **Historique des logos** précédents
- **Génération de thumbnails** pour l'affichage

---

**Date de création :** 10 septembre 2025  
**Version :** 1.0  
**Statut :** Implémenté et testé

**Fichiers modifiés/créés :**
- `lib/db/schema.ts` (ajout champ `logoUrl`)
- `app/api/upload/center-logo/route.ts` (endpoint upload)
- `app/api/upload/center-logo/delete/route.ts` (endpoint suppression)
- `app/api/profile/center/logo-url/route.ts` (endpoint URL signée)
- `components/profile/center-profile-page.tsx` (interface utilisateur)
