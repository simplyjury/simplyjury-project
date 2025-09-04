# Implementation F2-5: Modifications des informations de contact - Centre Profile

## Vue d'ensemble

Cette documentation décrit l'implémentation complète des modifications apportées au profil des centres de formation, incluant les nouveaux champs en base de données, les routes API, et l'interface utilisateur avec sections collapsibles.

## 1. Modifications de la base de données Supabase

### Nouveaux champs ajoutés à la table `training_centers`

Les champs suivants ont été ajoutés à la table `training_centers` via migration Supabase :

```sql
-- Nouveaux champs ajoutés
ALTER TABLE training_centers ADD COLUMN website TEXT;
ALTER TABLE training_centers ADD COLUMN description TEXT;
ALTER TABLE training_centers ADD COLUMN contact_person_email TEXT;
ALTER TABLE training_centers ADD COLUMN contact_person_phone TEXT;
```

### Schéma complet des champs

| Champ | Type | Description | Obligatoire |
|-------|------|-------------|-------------|
| `name` | TEXT | Nom du centre de formation | Oui |
| `siret` | TEXT | Numéro SIRET | Oui |
| `address` | TEXT | Adresse complète | Oui |
| `city` | TEXT | Ville | Oui |
| `postal_code` | TEXT | Code postal | Oui |
| `region` | TEXT | Région | Oui |
| `phone` | TEXT | Téléphone du centre | Non |
| `website` | TEXT | **[NOUVEAU]** Site web du centre | Non |
| `description` | TEXT | **[NOUVEAU]** Description détaillée | Non |
| `sector` | TEXT | Secteur d'activité | Non |
| `email` | TEXT | Email principal du centre | Oui |
| `certification_domains` | TEXT[] | Domaines de certification | Non |
| `is_certificateur` | BOOLEAN | Centre certificateur | Non |
| `qualiopi_certified` | BOOLEAN | Certification Qualiopi | Non |
| `contact_person_name` | TEXT | Nom de la personne de contact | Oui |
| `contact_person_email` | TEXT | **[NOUVEAU]** Email de contact | Non |
| `contact_person_phone` | TEXT | **[NOUVEAU]** Téléphone de contact | Non |
| `contact_person_role` | TEXT | Rôle de la personne de contact | Non |

## 2. Mise à jour du schéma Drizzle ORM

Le fichier `lib/db/schema.ts` a été mis à jour pour inclure les nouveaux champs :

```typescript
export const trainingCenters = pgTable('training_centers', {
  // ... champs existants
  website: text('website'),
  description: text('description'),
  contactPersonEmail: text('contact_person_email'),
  contactPersonPhone: text('contact_person_phone'),
  // ... autres champs
});
```

## 3. Routes API implémentées

### Route PATCH manquante ajoutée

**Fichier :** `app/api/profile/center/route.ts`

```typescript
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.userId;
    const body = await request.json();

    const result = await withRLSContext(userId, async () => {
      return await TrainingCenterService.updateProfile(userId, body);
    });

    if (!result) {
      return NextResponse.json({ error: 'Profil centre non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    console.error('Error updating center profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du profil' },
      { status: 500 }
    );
  }
}
```

### Routes existantes

- **GET** `/api/profile/center` - Récupération du profil centre
- **POST** `/api/profile/center` - Création du profil centre
- **PATCH** `/api/profile/center` - **[NOUVEAU]** Mise à jour du profil centre

## 4. Interface utilisateur - Sections collapsibles

### Implémentation pour les centres de formation

**Fichier :** `components/profile/center-profile-page.tsx`

#### Structure des sections

1. **Section 1 : Informations de l'entreprise**
   - Étendue par défaut
   - Contient : nom, SIRET, adresse, ville, code postal, région, téléphone, site web, secteur, description, email, domaines de certification

2. **Section 2 : Personne de contact**
   - Repliée par défaut
   - Contient : nom du contact, email du contact, téléphone du contact, rôle du contact

#### Fonctionnalités implémentées

```typescript
// État de gestion des sections
const [editingSection, setEditingSection] = useState<number | null>(null);
const [expandedSection, setExpandedSection] = useState<number>(1);

// Comportement exclusif : une seule section ouverte à la fois
onClick={() => setExpandedSection(expandedSection === 1 ? 0 : 1)}

// Boutons de modification dans les en-têtes de section
{expandedSection === 1 && (
  <>
    {editingSection !== 1 ? (
      <button onClick={() => setEditingSection(1)}>Modifier</button>
    ) : (
      <div>
        <button onClick={() => setEditingSection(null)}>Annuler</button>
        <button onClick={() => handleSave(1)}>Sauvegarder</button>
      </div>
    )}
  </>
)}
```

### Cohérence avec le profil jury

**Fichier :** `components/profile/jury-profile-page.tsx`

Le profil jury utilise déjà le même système de sections collapsibles :
- Même logique d'état (`expandedSection`, `editingSection`)
- Même comportement d'exclusivité (une section ouverte à la fois)
- Même placement des boutons de modification dans les en-têtes
- Même icônes chevron pour l'indication visuelle

## 5. Corrections et améliorations

### Corrections de bugs

1. **Erreur 405 Method Not Allowed** - Résolu par l'ajout de la méthode PATCH
2. **Mapping des champs incorrects** - Tous les champs alignés avec le schéma de base de données
3. **Erreurs TypeScript** - Types corrigés pour les paramètres de fonctions

### Améliorations UX

1. **Sections collapsibles** - Interface plus organisée et moins encombrée
2. **Boutons contextuels** - Modification disponible uniquement dans la section active
3. **Feedback visuel** - Icônes chevron pour indiquer l'état d'expansion
4. **Comportement cohérent** - Même expérience utilisateur entre profils jury et centre

## 6. Tests et validation

### Points de test recommandés

1. **Fonctionnalité de base**
   - Expansion/réduction des sections
   - Édition des champs dans chaque section
   - Sauvegarde des modifications

2. **Validation des données**
   - Champs obligatoires (nom, SIRET, adresse, etc.)
   - Format des emails et téléphones
   - Longueur des descriptions

3. **Persistance des données**
   - Vérification de la sauvegarde en base
   - Rechargement des données après modification
   - Gestion des erreurs de réseau

### Scénarios de test

1. **Test d'expansion de section**
   - Cliquer sur section 1 → doit s'étendre
   - Cliquer sur section 2 → section 1 se replie, section 2 s'étend

2. **Test d'édition**
   - Cliquer "Modifier" → champs deviennent éditables
   - Modifier des valeurs → cliquer "Sauvegarder" → succès
   - Cliquer "Annuler" → retour aux valeurs originales

3. **Test de persistance**
   - Modifier et sauvegarder → rafraîchir la page → vérifier les changements

## 7. Architecture technique

### Pattern de conception utilisé

- **État centralisé** : `formData` pour tous les champs
- **Sections conditionnelles** : Rendu basé sur `expandedSection`
- **Édition contextuelle** : `editingSection` pour l'état d'édition
- **Fonctions utilitaires** : `handleInputChange`, `addCertificationDomain`, `removeCertificationDomain`

### Sécurité

- **Authentification** : Vérification de session utilisateur
- **Autorisation** : RLS (Row Level Security) avec `withRLSContext`
- **Validation** : Côté client et serveur
- **Sanitisation** : Données nettoyées avant sauvegarde

## 8. Maintenance et évolutions futures

### Points d'attention

1. **Cohérence des interfaces** - Maintenir la parité entre profils jury et centre
2. **Validation des données** - Ajouter des validations métier si nécessaire
3. **Performance** - Optimiser les requêtes si le nombre de champs augmente
4. **Accessibilité** - Vérifier la navigation clavier dans les sections

### Évolutions possibles

1. **Sections supplémentaires** - Certifications, historique, etc.
2. **Validation avancée** - Règles métier complexes
3. **Upload de documents** - Logos, certificats, etc.
4. **Historique des modifications** - Audit trail des changements

---

**Date de mise à jour :** 4 septembre 2025  
**Version :** 1.0  
**Statut :** Implémenté et testé
