# Implémentation F3-4 : Modal "Voir Profil" du Jury et Demandes Structurées

## Vue d'ensemble

Cette fonctionnalité permet aux centres de formation de :
1. **Consulter le profil détaillé** d'un jury via le bouton "Voir profil" 
2. **Envoyer des demandes structurées** via le bouton "Contacter" depuis la page de recherche

Le système inclut un modal de profil complet et un système de demandes structurées avec base de données dédiée et API endpoints.

## Architecture des composants

### 1. Composant principal : `JuryProfileModal`

**Fichier :** `/components/ui/jury-profile-modal.tsx`

**Interface TypeScript :**
```typescript
interface JuryProfile {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  expertiseDomains: string[];
  workModalities: string[];
  interventionZones: string[];
  bio: string;
  currentPosition: string;
  experienceYears: number;
  hourlyRate: number;
  availabilityPreferences?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    modalities: string[];
    note?: string;
  }>;
  profilePhotoUrl?: string;
  email?: string;
  phone?: string;
  company?: string;
}
```

### 2. Intégration dans la page de recherche

**Fichier :** `/app/(dashboard)/dashboard/search/page.tsx`

Le modal est déclenché par le bouton "Voir profil" dans chaque carte de jury :

```typescript
<Button
  variant="ghost"
  onClick={() => handleViewProfile(jury)}
  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm cursor-pointer"
>
  Voir profil
</Button>
```

## Flux de données

### 1. API Route : `/app/api/jury/search/route.ts`

L'API récupère les données depuis Supabase et les transforme pour le frontend :

```typescript
return {
  id: jury.id,
  name: `${jury.firstName} ${jury.lastName}`,
  location: `${jury.city}, ${jury.region}`,
  rating: Math.random() * 1 + 4,
  reviewCount: Math.floor(Math.random() * 50) + 5,
  avatar: getAvatarEmoji(jury.expertiseDomains?.[0] || ''),
  expertiseDomains: jury.expertiseDomains || [],
  workModalities: jury.workModalities || [],
  status: getAvailabilityStatus(jury.availabilityPreferences),
  statusText: getAvailabilityText(jury.availabilityPreferences),
  experienceYears: jury.experienceYears,
  currentPosition: jury.currentPosition,
  hourlyRate: jury.hourlyRate,
  bio: jury.bio,
  profilePhotoUrl: signedPhotoUrl,
  interventionZones: jury.interventionZones,
  availabilityPreferences: jury.availabilityPreferences // Crucial pour le modal
};
```

### 2. Base de données Supabase

**Table :** `jury_profiles`

**Champs clés :**
- `availability_preferences` (JSONB) : Contient les créneaux de disponibilité
- `expertise_domains` (Array) : Domaines d'expertise
- `work_modalities` (Array) : Modalités de travail (visio/présentiel)
- `intervention_zones` (Array) : Zones d'intervention

## Sections du modal

### 1. En-tête avec gradient
- Photo de profil ou avatar emoji
- Nom complet du jury
- Localisation
- Note et nombre d'avis

### 2. Profil professionnel
- Poste actuel
- Entreprise
- Années d'expérience
- Formation
- Biographie

### 3. Domaines d'expertise
- Affichage des tags d'expertise avec style dégradé vert

### 4. Modalités acceptées
- Cartes pour Visioconférence et Présentiel
- Affichage conditionnel selon les modalités supportées

### 5. Zone d'intervention
- Tags des régions d'intervention avec style jaune

### 6. Disponibilités
- **Filtrage automatique :** Seules les disponibilités futures sont affichées
- **Format des dates :** Format français (ex: "15 septembre 2025 - 15 octobre 2025")
- **Modalités :** Icônes pour visio/présentiel
- **Notes :** Affichage des commentaires de disponibilité

## Logique de filtrage des disponibilités

```typescript
const now = new Date();
const futureAvailabilities = jury.availabilityPreferences?.filter((pref: any) => {
  const endDate = new Date(pref.endDate);
  return endDate > now;
}) || [];
```

**Cas particuliers :**
- Si aucune disponibilité future : "Aucune disponibilité future renseignée"
- Format de date localisé en français
- Support des modalités multiples par période

## Gestion des erreurs et sécurité

### 1. Protection contre les propriétés undefined
```typescript
{jury.expertiseDomains?.map((tag: string, index: number) => (
  // Rendu conditionnel sécurisé
))}
```

### 2. Gestion du modal personnalisé
- Suppression du bouton de fermeture par défaut de Dialog
- Bouton de fermeture personnalisé dans l'en-tête
- Prévention de la fermeture accidentelle

```typescript
const CustomDialogContent = ({ className, children, ...props }: any) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content>
      {children}
      {/* Pas de bouton de fermeture par défaut */}
    </DialogPrimitive.Content>
  </DialogPortal>
);
```

## Styles et design

### 1. Couleurs principales
- **Bleu principal :** `#0d4a70`
- **Vert accent :** `#13d090`
- **Jaune zones :** `rgba(253,206,15,0.1)`

### 2. Animations
- Hover effects sur les tags
- Transitions fluides (200ms)
- Effets d'ombre dynamiques

### 3. Responsive design
- Largeur maximale : 900px
- Hauteur maximale : 90vh
- Scroll interne pour le contenu

## Points d'attention techniques

### 1. Données manquantes
- Vérification systématique avec l'opérateur `?.`
- Valeurs par défaut pour les champs optionnels
- Gestion gracieuse des arrays vides

### 2. Performance
- Filtrage côté client pour les disponibilités
- Lazy loading des images de profil
- URLs signées pour les photos (expiration 1h)

### 3. Accessibilité
- Labels appropriés pour les icônes
- Contraste suffisant pour tous les textes
- Navigation au clavier supportée

## Tests et validation

### 1. Cas de test
- Jury avec toutes les données complètes
- Jury avec données partielles
- Jury sans disponibilités futures
- Jury avec photo vs avatar emoji

### 2. Validation des données
- Format des dates de disponibilité
- Cohérence des modalités de travail
- Intégrité des zones d'intervention

---

# SYSTÈME DE DEMANDES STRUCTURÉES

## Architecture des composants

### 1. Composant Modal : `StructuredRequestModal`

**Fichier :** `/components/jury/structured-request-modal.tsx`

**Interface TypeScript :**
```typescript
interface StructuredRequestData {
  juryId: number;
  certificationType: string;
  sessionDate: string;
  candidateCount: number;
  startTime: string;
  endTime: string;
  modality: 'presentiel' | 'visio' | 'hybride';
  location?: string;
  transportCovered: boolean;
  mealsCovered: boolean;
  accommodationCovered: boolean;
  customMessage: string;
}

interface JuryProfile {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  rating?: number;
  expertiseDomains: string[];
  city?: string;
  region?: string;
}
```

### 2. Fonctionnalités du Modal

**Sections principales :**
1. **En-tête avec informations jury** - Nom, note, expertise
2. **Notice freemium** - Limitation à 1 contact gratuit
3. **Certification et session** - Type, date, nombre de candidats, horaires
4. **Modalités et logistique** - Présentiel/Visio/Hybride, lieu, frais
5. **Message personnalisé** - Zone de texte avec compteur (1000 caractères)

**Validation en temps réel :**
- Champs obligatoires marqués avec astérisque rouge
- Validation conditionnelle du lieu pour présentiel/hybride
- Compteur de caractères avec alertes visuelles
- Dates minimum = aujourd'hui

## Base de données - Schema Changes

### 1. Table `jury_requests`

**Migration :** `create_jury_requests_table`

```sql
CREATE TABLE public.jury_requests (
    id SERIAL PRIMARY KEY,
    
    -- Participants
    training_center_id INTEGER NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
    jury_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Request metadata
    request_type VARCHAR(50) NOT NULL DEFAULT 'structured' CHECK (request_type IN ('simple_contact', 'structured')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    
    -- Certification and session details
    certification_title VARCHAR(500),
    certification_code VARCHAR(100), -- RNCP code
    session_date DATE,
    candidate_count INTEGER CHECK (candidate_count > 0 AND candidate_count <= 100),
    
    -- Time slots
    session_start_time TIME,
    session_end_time TIME,
    
    -- Modality and logistics
    modality VARCHAR(50) CHECK (modality IN ('presentiel', 'visio', 'hybride')),
    session_location TEXT,
    
    -- Expenses covered
    transport_covered BOOLEAN DEFAULT false,
    meals_covered BOOLEAN DEFAULT false,
    accommodation_covered BOOLEAN DEFAULT false,
    
    -- Communication
    custom_message TEXT,
    jury_response TEXT,
    jury_response_date TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_session_times CHECK (session_start_time < session_end_time),
    CONSTRAINT location_required_for_physical CHECK (
        (modality IN ('presentiel', 'hybride') AND session_location IS NOT NULL) 
        OR modality = 'visio'
    )
);
```

### 2. Table `conversations`

**Migration :** `create_conversations_and_messages_tables`

```sql
CREATE TABLE public.conversations (
    id SERIAL PRIMARY KEY,
    training_center_id INTEGER NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
    jury_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jury_request_id INTEGER REFERENCES jury_requests(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    subject VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(training_center_id, jury_id)
);
```

### 3. Table `messages`

```sql
CREATE TABLE public.messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('centre', 'jury')),
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'request_update')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Row Level Security (RLS)

**Politiques implémentées :**
- `training_centers_own_requests` - Centres accèdent à leurs demandes
- `juries_received_requests` - Jurys accèdent aux demandes reçues
- `users_conversation_messages` - Messages dans conversations autorisées
- `admins_all_*` - Admins accès complet

## API Endpoints

### 1. POST `/api/jury-requests`

**Fonctionnalités :**
- Création de demandes structurées
- Validation des champs obligatoires
- Vérification des limites freemium
- Création automatique de conversation
- Messages système et personnalisés

**Authentification :** JWT Bearer token via cookies

**Validation :**
```typescript
// Champs requis
const requiredFields = ['juryId', 'certificationType', 'sessionDate', 'candidateCount'];

// Validation conditionnelle
if ((modality === 'presentiel' || modality === 'hybride') && !location) {
  return error('Le lieu est requis pour les sessions en présentiel ou hybrides');
}

// Vérification jury validé
const jury = await supabase
  .from('users')
  .select('id, user_type, validation_status')
  .eq('id', juryId)
  .eq('user_type', 'jury')
  .eq('validation_status', 'validated')
  .single();
```

**Limite freemium :**
```typescript
if (trainingCenter.subscription_tier === 'gratuit') {
  const existingRequests = await supabase
    .from('jury_requests')
    .select('id')
    .eq('training_center_id', trainingCenter.id)
    .limit(1);
    
  if (existingRequests?.length > 0) {
    return error('Limite atteinte pour le plan gratuit');
  }
}
```

### 2. GET `/api/jury-requests`

**Fonctionnalités :**
- Récupération des demandes avec pagination
- Filtrage par statut
- Jointures avec tables liées
- Respect des politiques RLS

**Paramètres de requête :**
- `status` - Filtrer par statut
- `page` - Numéro de page (défaut: 1)
- `limit` - Éléments par page (défaut: 10)

**Réponse :**
```typescript
{
  success: true,
  data: [
    {
      id: number,
      training_center: { name, contact_person_name },
      jury: { id, name },
      jury_profile: { first_name, last_name, expertise_domains },
      // ... autres champs
    }
  ],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## Intégration dans la page de recherche

### 1. Gestion des états

```typescript
const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
const [selectedJuryForRequest, setSelectedJuryForRequest] = useState<JuryProfile | null>(null);
```

### 2. Handler de contact

```typescript
const handleContact = (jury: JuryProfile) => {
  if (!hasUsedFreeContact && contactsRemaining > 0) {
    setSelectedJuryForRequest(jury);
    setIsRequestModalOpen(true);
  } else {
    alert('Limite freemium atteinte. Passez au plan Pro pour plus de contacts.');
  }
};
```

### 3. Soumission de demande

```typescript
const handleSubmitRequest = async (requestData: any) => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];

  const response = await fetch('/api/jury-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestData)
  });

  if (result.success) {
    setHasUsedFreeContact(true);
    setContactsRemaining(0);
    alert('Demande envoyée avec succès !');
  }
};
```

## Flux de données complet

### 1. Workflow utilisateur
1. **Recherche jury** → Page `/dashboard/search`
2. **Clic "Contacter"** → Ouverture `StructuredRequestModal`
3. **Remplissage formulaire** → Validation temps réel
4. **Soumission** → POST `/api/jury-requests`
5. **Création BDD** → `jury_requests` + `conversations` + `messages`
6. **Confirmation** → Message succès + limite freemium

### 2. Sécurité et validation
- **Authentification JWT** obligatoire
- **RLS policies** sur toutes les tables
- **Validation côté client** et serveur
- **Sanitisation** des entrées utilisateur
- **Limites freemium** appliquées

## Évolutions futures possibles

1. **Système de favoris** : Bouton pour sauvegarder un jury
2. **Calendrier interactif** : Vue calendrier des disponibilités
3. **Historique des collaborations** : Affichage des missions passées
4. **Système de recommandations** : Jurys similaires
5. **Notifications temps réel** : WebSockets pour les réponses
6. **Système de paiement** : Upgrade automatique plan Pro
7. **Templates de messages** : Messages pré-définis
8. **Export PDF** : Génération de contrats automatiques

## Dépendances

- **UI Components :** Shadcn/ui (Dialog, Button, etc.)
- **Icons :** Lucide React (Star, MapPin, Video, Users, etc.)
- **Database :** Supabase avec Drizzle ORM
- **Styling :** Tailwind CSS
- **TypeScript :** Pour la sécurité des types
- **Authentication :** JWT avec jose library
- **Validation :** Zod (côté serveur)
- **State Management :** React useState/useEffect
