# F4-6 - Messagerie Texte (Text Messaging System)

## Vue d'ensemble

Cette documentation détaille l'implémentation complète du système de messagerie texte entre les centres de formation et les jurys dans l'application SimplyJury. Le système permet une communication bidirectionnelle avec une interface utilisateur distincte pour chaque type d'utilisateur.

## Architecture du Système

### Structure des Données

#### Table `conversations`
- `id`: Identifiant unique de la conversation
- `jury_id`: Référence vers l'utilisateur jury
- `training_center_id`: Référence vers le centre de formation
- `status`: Statut de la conversation ('active', 'closed')
- `created_at`: Date de création
- `last_message_at`: Timestamp du dernier message

#### Table `messages`
- `id`: Identifiant unique du message
- `conversation_id`: Référence vers la conversation
- `sender_id`: ID de l'expéditeur
- `sender_type`: Type d'expéditeur ('jury' ou 'centre')
- `message_type`: Type de message ('text', 'system')
- `content`: Contenu du message
- `read_at`: Timestamp de lecture (NULL si non lu)
- `created_at`: Date de création

### Contraintes de Base de Données

```sql
-- Contrainte sur sender_type
ALTER TABLE messages ADD CONSTRAINT messages_sender_type_check 
CHECK (sender_type IN ('centre', 'jury'));
```

## APIs Implémentées

### 1. APIs pour les Jurys

#### GET `/api/conversations`
Récupère la liste des conversations pour un jury avec:
- Nom et informations du centre de formation
- Aperçu du dernier message (sans préfixe "Objet:")
- Nombre de messages non lus
- Timestamp formaté en français

#### GET `/api/conversations/[id]/messages`
Récupère tous les messages d'une conversation spécifique:
- Marque automatiquement les messages du centre comme lus
- Retourne les détails de la conversation et la liste des messages
- Gestion des paramètres asynchrones (Next.js 15)

#### POST `/api/conversations/[id]/messages/send`
Permet à un jury d'envoyer un message:
- Validation du contenu
- Insertion avec `sender_type: 'jury'`
- Mise à jour du timestamp de la conversation

### 2. APIs pour les Centres

#### GET `/api/center-conversations`
Récupère la liste des conversations pour un centre avec:
- Nom et email du jury
- Aperçu du dernier message
- Nombre de messages non lus
- Initiales du jury pour l'avatar

#### GET `/api/center-conversations/[id]/messages`
Récupère tous les messages d'une conversation spécifique:
- Marque automatiquement les messages du jury comme lus
- Retourne les détails du jury et la liste des messages

#### POST `/api/center-conversations/[id]/messages/send`
Permet à un centre d'envoyer un message:
- Validation du contenu
- Insertion avec `sender_type: 'centre'`
- Mise à jour du timestamp de la conversation

### 3. API Commune

#### GET `/api/unread-messages-count`
Calcule le nombre de messages non lus pour l'utilisateur connecté:
- Pour les jurys: compte les messages des centres non lus
- Pour les centres: compte les messages des jurys non lus
- Utilise `sender_type` pour identifier l'expéditeur

## Composants Frontend

### 1. Composants pour les Jurys

#### `ConversationList`
- Affiche la liste des centres de formation
- Aperçu des messages avec troncature
- Indicateurs de messages non lus (badges rouges)
- Sélection de conversation active

#### `ChatArea`
- Zone de chat avec bulles de messages
- Messages des jurys: bulles vertes à droite
- Messages des centres: bulles violettes à gauche
- Zone de saisie avec bouton d'envoi

### 2. Composants pour les Centres

#### `CenterConversationList`
- Affiche la liste des jurys ayant contacté le centre
- Nom, email et initiales du jury
- Aperçu des messages et indicateurs non lus
- Design cohérent avec l'interface jury

#### `CenterChatArea`
- Zone de chat adaptée pour les centres
- Messages des centres: bulles bleues à droite
- Messages des jurys: bulles vertes à gauche
- Bouton "Voir profil" pour accéder au profil du jury

### 3. Navigation Sidebar

#### Compteur de Messages Non Lus
- Badge jaune avec le nombre réel de messages non lus
- Mise à jour automatique toutes les 60 secondes
- Différenciation jury/centre dans le calcul

## Gestion des États et Données

### SWR (Stale-While-Revalidate)
- Rafraîchissement des conversations: 30 secondes
- Rafraîchissement du compteur: 60 secondes
- Désactivation de la revalidation au focus pour optimiser les performances

### Gestion des Messages
- Mise à jour en temps réel lors de l'envoi
- Marquage automatique comme lu à l'ouverture
- Formatage des timestamps en français

## Sécurité et Authentification

### Authentification JWT
- Utilisation du cookie `session`
- Vérification du type d'utilisateur
- Validation des permissions d'accès aux conversations

### Row Level Security (RLS)
- Vérification que l'utilisateur a accès à la conversation
- Isolation des données par type d'utilisateur
- Protection contre l'accès non autorisé

## Optimisations de Performance

### Réduction des Appels API
- Intervalles de rafraîchissement optimisés
- Désactivation de la revalidation au focus
- Suppression des logs de debug

### Requêtes Optimisées
- Utilisation de `sender_type` au lieu de jointures complexes
- Index sur les champs de recherche fréquents
- Limitation des résultats avec LIMIT

## Gestion des Erreurs

### Erreurs de Base de Données
- Contraintes de validation sur `sender_type`
- Gestion des champs NULL/NOT NULL
- Messages d'erreur explicites

### Erreurs d'API
- Validation des paramètres d'entrée
- Gestion des sessions expirées
- Codes de statut HTTP appropriés

### Erreurs Frontend
- Gestion des états de chargement
- Messages d'erreur utilisateur
- Fallbacks pour les données manquantes

## Migration Next.js 15

### Paramètres Asynchrones
Tous les routes avec paramètres dynamiques ont été mis à jour:

```typescript
// Avant
{ params }: { params: { id: string } }

// Après
{ params }: { params: Promise<{ id: string }> }

// Usage
const { id } = await params;
```

## Tests et Validation

### Scénarios Testés
1. ✅ Jury envoie un message à un centre
2. ✅ Centre répond au jury
3. ✅ Compteurs de messages non lus mis à jour
4. ✅ Messages marqués comme lus à l'ouverture
5. ✅ Interface responsive sur mobile/desktop
6. ✅ Gestion des erreurs de réseau

### Données de Test
- Conversation ID 5 entre jury ID 49 et centre ID 2
- Messages avec différents `sender_type`
- Validation des contraintes de base de données

## Déploiement et Configuration

### Variables d'Environnement
- Configuration Supabase dans `.env.local`
- Clés JWT pour l'authentification
- URLs d'API pour les différents environnements

### Base de Données
- Migrations appliquées via Supabase MCP
- Contraintes et index créés
- Données de test insérées

## Améliorations Futures

### Fonctionnalités Prévues
- Notifications push en temps réel
- Pièces jointes (images, documents)
- Historique de conversation étendu
- Recherche dans les messages
- Archivage des conversations

### Optimisations Techniques
- WebSocket pour les mises à jour temps réel
- Pagination des messages anciens
- Compression des images
- Cache Redis pour les conversations fréquentes

## Conclusion

Le système de messagerie texte est maintenant pleinement fonctionnel avec:
- Communication bidirectionnelle jury ↔ centre
- Interface utilisateur intuitive et responsive
- Compteurs de messages non lus en temps réel
- Sécurité et authentification robustes
- Performance optimisée pour une utilisation en production

Le système respecte les bonnes pratiques de développement et est prêt pour une montée en charge avec les améliorations futures planifiées.
