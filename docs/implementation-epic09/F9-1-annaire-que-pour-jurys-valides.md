# F9-1 - Annuaire des centres accessible uniquement aux jurys validés

## Contexte
Actuellement, tous les jurys authentifiés peuvent accéder à l'annuaire des centres de formation et voir la liste complète des centres, même si leur compte n'est pas encore validé par un administrateur SimplyJury. Cette fonctionnalité implémente une restriction d'accès basée sur le statut de validation du jury.

## Objectif
Restreindre l'accès à l'annuaire des centres de formation uniquement aux jurys dont le statut de validation est "validated". Les jurys avec un statut "pending" doivent pouvoir accéder à la page mais ne doivent pas voir la liste des centres ni pouvoir les contacter.

## Implémentation

### 1. Modifications apportées au composant CentersPage

**Fichier modifié :** `/app/(dashboard)/dashboard/jury/centres/page.tsx`

#### Ajouts d'état
```typescript
const [userValidationStatus, setUserValidationStatus] = useState<string | null>(null);
const [userLoading, setUserLoading] = useState(true);
```

#### Nouvelle fonction de récupération du statut utilisateur
```typescript
const fetchUserValidationStatus = async () => {
  try {
    setUserLoading(true);
    const response = await fetch('/api/user');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du profil utilisateur');
    }
    
    const userData = await response.json();
    setUserValidationStatus(userData?.validationStatus || null);
  } catch (err) {
    console.error('Erreur lors de la récupération du statut de validation:', err);
    setError(err instanceof Error ? err.message : 'Une erreur est survenue');
  } finally {
    setUserLoading(false);
  }
};
```

#### Logique conditionnelle d'affichage

**État de chargement de la validation :**
```typescript
if (userLoading) {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13d090] mx-auto"></div>
        <p className="mt-2 text-gray-600">Vérification du statut de validation...</p>
      </div>
    </div>
  );
}
```

**Alertes conditionnelles selon le statut :**
```typescript
const isValidated = userValidationStatus === 'validated';

// Pour les jurys validés
{isValidated ? (
  <Alert className="mb-8 border-green-200 bg-green-50">
    <CheckCircle className="h-4 w-4 text-green-600" />
    <AlertDescription className="text-green-800">
      <strong>Profil validé avec succès !</strong> Vous pouvez maintenant contacter les centres de formation pour proposer vos services.
    </AlertDescription>
  </Alert>
) : (
  // Pour les jurys en attente
  <Alert className="mb-8 border-orange-200 bg-orange-50">
    <Clock className="h-4 w-4 text-orange-600" />
    <AlertDescription className="text-orange-800">
      <strong>Validation en attente</strong> - Votre compte doit être validé par un administrateur SimplyJury avant de pouvoir contacter les centres de formation.
    </AlertDescription>
  </Alert>
)}
```

### 2. Restrictions d'accès aux fonctionnalités

#### Sections masquées pour les jurys non validés :
- **Barre de recherche** : `{isValidated && (...)}`
- **En-tête des résultats** : `{isValidated && (...)}`
- **État de chargement des centres** : `{isValidated && loading && (...)}`
- **Grille des centres** : `{isValidated && !loading && (...)}`
- **État vide** : `{isValidated && !loading && centers.length === 0 && (...)}`

#### Message pour les jurys non validés :
```typescript
{!isValidated && (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Clock className="h-8 w-8 text-orange-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Validation en cours
    </h3>
    <p className="text-gray-600 max-w-md mx-auto">
      Votre profil de jury est en cours de validation par notre équipe. Une fois validé, vous pourrez accéder à l'annuaire complet des centres de formation et les contacter directement.
    </p>
  </div>
)}
```

### 3. API utilisée

L'implémentation utilise l'endpoint existant `/api/user` qui retourne les informations de l'utilisateur connecté, incluant le champ `validationStatus`.

**Endpoint :** `GET /api/user`
**Réponse :** Objet utilisateur avec le champ `validationStatus` (`"pending"` | `"validated"` | `"rejected"`)

## Comportement attendu

### Pour un jury avec statut "validated" :
- ✅ Voit l'alerte verte de confirmation de validation
- ✅ Accès à la barre de recherche
- ✅ Voit la liste complète des centres de formation
- ✅ Peut contacter les centres via les boutons "Contacter"
- ✅ Peut voir les profils des centres

### Pour un jury avec statut "pending" :
- ⚠️ Voit l'alerte orange indiquant que la validation est en attente
- ❌ N'a pas accès à la barre de recherche
- ❌ Ne voit pas la liste des centres de formation
- ❌ Ne peut pas contacter les centres
- ℹ️ Voit un message explicatif sur la validation en cours

## Tests de validation

### Test avec utilisateur en attente :
- **Email testé :** `cedric.kerbidi+33@gmail.com`
- **Statut en base :** `validation_status = "pending"`
- **Résultat attendu :** Accès à la page mais pas aux centres

### Vérification en base de données :
```sql
SELECT email, user_type, validation_status 
FROM users 
WHERE email = 'cedric.kerbidi+33@gmail.com';
```

## Impact sur l'UX

Cette implémentation améliore l'expérience utilisateur en :
1. **Clarté** : Le jury comprend immédiatement pourquoi il ne peut pas accéder aux centres
2. **Transparence** : Information claire sur le processus de validation
3. **Sécurité** : Respect des règles métier de validation avant contact
4. **Cohérence** : Alignement avec le workflow de validation administrateur

## Notes techniques

- Utilisation de l'icône `Clock` de Lucide React pour les états d'attente
- Conservation de la structure de navigation (l'URL reste accessible)
- Gestion d'erreur intégrée pour les cas d'échec de récupération du statut
- Performance optimisée avec un seul appel API au chargement de la page