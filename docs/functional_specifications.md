# Spécifications Fonctionnelles - SimplyJury MVP

## 📋 Informations Générales

**Nom du projet :** SimplyJury  
**Version :** MVP (Minimum Viable Product)  
**Objectif :** Plateforme web de mise en relation entre centres de formation et jurys externes qualifiés pour les certifications professionnelles  
**Durée de développement :** 5 semaines  
**Budget :** 6 360€ TTC  

---

## 🎯 Vision Produit

SimplyJury vise à simplifier et accélérer la recherche de jurys qualifiés pour les centres de formation en France. La plateforme propose une approche freemium permettant de tester le marché avec une fonctionnalité de base gratuite (1 mise en relation) avant d'évoluer vers une offre premium.

---

## 👥 Personas & Utilisateurs Cibles

### Centre de Formation
- **Profile :** CFA, Organismes de Formation, Écoles privées/publiques
- **Besoin :** Trouver rapidement des jurys qualifiés pour leurs certifications
- **Pain Point :** Difficulté à identifier et contacter des jurys disponibles et compétents

### Jury Professionnel  
- **Profile :** Formateurs, consultants, experts métiers certifiés
- **Besoin :** Recevoir des missions de jury dans leur domaine d'expertise
- **Pain Point :** Manque de visibilité et difficultés pour être contacté par les centres

### Administrateur
- **Profile :** Équipe SimplyJury
- **Besoin :** Superviser la plateforme, valider les profils, suivre l'activité
- **Pain Point :** Garantir la qualité des profils et des mises en relation

---

## 🏗️ Architecture Fonctionnelle

### EPIC 1 : Gestion des Utilisateurs & Authentification

#### Feature 1.1 : Système d'Authentification
**Description :** Permettre aux utilisateurs de créer un compte et se connecter de manière sécurisée

**User Stories :**
- En tant qu'utilisateur, je peux créer un compte en choisissant mon rôle (Centre ou Jury)
- En tant qu'utilisateur, je peux me connecter avec mon email et mot de passe
- En tant qu'utilisateur, je peux réinitialiser mon mot de passe en cas d'oubli
- En tant qu'utilisateur, je peux me déconnecter de la plateforme

**Critères d'acceptation :**
- Validation email obligatoire à l'inscription
- Mots de passe sécurisés (8 caractères min, majuscules, chiffres)
- Token de réinitialisation valide 24h
- Sessions sécurisées avec timeout automatique

#### Feature 1.2 : Profils Centres de Formation
**Description :** Permettre aux centres de compléter et gérer leur profil institutionnel avec auto-complétion SIRET et détection automatique Qualiopi

**User Stories :**
- En tant que centre de formation, je peux renseigner mes informations via SIRET avec auto-complétion
- En tant que centre de formation, je vois automatiquement si mon organisme possède Qualiopi
- En tant que centre de formation, je peux modifier mes informations de contact
- **En tant que centre, je peux préciser si je suis certificateur via une checkbox**
- **En tant que centre certificateur, je peux rattacher mes certifications via l'API France Compétence**
- En tant que centre, je peux modifier mon profil à tout moment

**Spécifications techniques :**
- **API Pappers** pour auto-complétion via SIRET/SIREN
  - Récupération automatique : nom, adresse, secteur d'activité
- **API Entreprise (Qualiopi & habilitations France compétences)** pour certification
  - Endpoint : `/carif_oref/certifications_qualiopi_france_competences`
  - Récupération : statut Qualiopi actuel, types de qualification, habilitations France Compétences
  - Nécessite inscription et authentification pour usage production
- **Stratégie d'intégration :**
  1. Saisie SIRET → API Pappers (informations entreprise)
  2. SIRET → API Entreprise (statut Qualiopi)
  3. Combinaison des réponses pour profil complet
- **Fallback :** Déclaration manuelle Qualiopi si API indisponible
- Champs : nom établissement, SIRET, email, téléphone, contact référent

**Critères d'acceptation :**
- Auto-complétion SIRET avec API Pappers (nom, adresse, secteur)
- Détection automatique du statut Qualiopi via API Entreprise
- Gestion des limitations d'API (rate limits, authentification)
- Mécanisme de fallback en cas d'indisponibilité API
- **Intégration API France Compétence pour les centres certificateurs**
- Validation SIRET obligatoire
- Champs obligatoires : nom établissement, SIRET, email, téléphone, contact référent
- **Checkbox "Centre certificateur" avec accès conditionnel aux certifications**
- Possibilité de sélectionner plusieurs domaines de certification
- **Liste des certifications rattachées visible pour les centres certificateurs**
- Interface utilisateur fluide malgré les appels API multiples

#### Feature 1.3 : Profils Jurys Professionnels
**Description :** Permettre aux jurys de créer et gérer leur profil professionnel complet avec validation administrative

**User Stories :**
- En tant que jury, je peux créer un profil complet avec photo, expériences et certifications
- En tant que jury, je peux définir mes disponibilités et modalités (visio/présentiel)
- En tant que jury, je peux visualiser mes avis et ma note moyenne
- En tant que jury, mon profil doit être validé par un admin avant d'être visible
- *En tant que jury, je peux sélectionner ma région administrative française*
- En tant que jury, je peux modifier mon profil après validation

**Spécifications techniques :**
- Informations requises : nom, photo, région, domaines d'expertise
- Expériences : diplômes ET expériences avec années (validation manuelle admin)
- Disponibilités : système de checkboxes ou calendrier simple
- Modalités : visio/présentiel/les deux
- Zone d'intervention : départements/régions si mobile
- Statut : En attente validation / Validé / Suspendu

**Critères d'acceptation :**
- Upload et redimensionnement photo jury
- Système de validation admin pour jurys
- Notification email validation/refus avec motifs
- Profils modifiables après validation
- *Utilisation de la liste officielle des 13 régions administratives françaises*
- *Statut initial "En attente de validation" par l'administration*
- Possibilité de sélectionner plusieurs domaines d'expertise
- Calendrier de disponibilités simple (checkbox ou similaire)

---

### EPIC 2 : Moteur de Recherche & Mise en Relation

#### Feature 2.1 : Recherche de Jurys
**Description :** Permettre aux centres de rechercher des jurys selon leurs critères

**User Stories :**
- En tant que centre, je peux rechercher des jurys par domaine de certification
- *En tant que centre, je peux filtrer par région administrative*
- En tant que centre, je peux filtrer par modalités (visio/présentiel)
- En tant que centre, je peux filtrer par disponibilités
- En tant que centre, je peux voir les profils jurys avec photo, domaine, région, note moyenne

**Critères d'acceptation :**
- Résultats affichés sous forme de cartes
- Pagination des résultats (20 par page)
- *Filtres basés sur les régions administratives françaises*
- Affichage des notes moyennes si disponibles
- Bouton "Contacter" visible sur chaque carte

#### Feature 2.2 : Système de Mise en Relation
**Description :** Faciliter le premier contact entre centres et jurys

**User Stories :**
- En tant que centre, je peux contacter un jury via un formulaire structuré
- En tant que centre, je peux spécifier : certification, dates, nombre de candidats, modalités, frais pris en charge
- **En tant que centre, je peux envoyer une demande structurée de mission de jury**
- En tant que centre freemium, je ne peux contacter qu'un seul jury gratuitement
- En tant que jury, je reçois les demandes dans mon tableau de bord
- **En tant que jury, je peux faire une demande de contact via la messagerie interne (texte uniquement)**
- En tant que jury, je peux accepter ou refuser une demande
- En tant que jury, je peux répondre avec un message personnalisé
- **En tant que centre, je peux transformer une demande de contact en demande structurée**

**Critères d'acceptation :**
- Formulaire avec champs obligatoires : certification, dates, nombre de candidats
- **Demandes structurées avec workflow complet (demande → contact → mission)**
- **Messagerie interne intégrée pour les premiers contacts (format texte uniquement)**
- Limitation à 1 contact gratuit pour les comptes freemium
- *Notifications par email à chaque nouvelle demande reçue*
- Statuts de demande : "En attente", "Acceptée", "Refusée"
- **Possibilité de conversion contact → demande structurée**
- Historique des demandes accessible

---

### EPIC 3 : Communication & Notifications

#### Feature 3.1 : Messagerie Interne
**Description :** Permettre l'échange de messages entre centres et jurys

**User Stories :**
- *En tant qu'utilisateur, je peux échanger des messages texte via la messagerie intégrée*
- *En tant qu'utilisateur, je reçois un email de notification à chaque nouveau message*
- En tant qu'utilisateur, je peux voir l'historique de mes conversations
- En tant qu'utilisateur, je peux voir le statut "lu/non lu" des messages

**Critères d'acceptation :**
- *Messagerie 1-to-1 intégrée à la plateforme (texte uniquement)*
- *Email de notification automatique pour chaque nouveau message*
- Interface simple avec historique chronologique
- Marquer les messages comme lus automatiquement

#### Feature 3.2 : Système de Notifications
**Description :** Informer les utilisateurs des événements importants

**User Stories :**
- *En tant qu'utilisateur, je peux voir mes notifications dans une cloche en header*
- En tant qu'utilisateur, je reçois des notifications pour : nouvelles demandes, réponses, nouveaux messages
- En tant qu'utilisateur, je peux marquer les notifications comme lues
- En tant qu'utilisateur, je peux accéder directement au contenu depuis la notification

**Critères d'acceptation :**
- *Icône cloche avec pastille numérique pour les notifications non lues*
- Notifications in-app + emails
- Accès direct aux demandes/messages depuis les notifications
- Auto-marquage "lu" lors de la consultation

---

### EPIC 4 : Tableaux de Bord & Historiques

#### Feature 4.1 : Dashboard Centre de Formation
**Description :** Interface de pilotage pour les centres de formation

**User Stories :**
- En tant que centre, j'accède à un tableau de bord avec mes informations essentielles
- **En tant que centre, je vois la liste complète des jurys contactés**
- En tant que centre, je vois les statuts de mes demandes
- En tant que centre, j'accède à l'historique de mes sessions réalisées
- **En tant que centre, je gère ma messagerie interne depuis le dashboard**
- **En tant que centre certificateur, j'accède à la liste de mes certifications rattachées**
- En tant que centre, j'accède rapidement à mes messages

**Critères d'acceptation :**
- Vue d'ensemble claire et ergonomique
- **Liste détaillée des jurys contactés avec historique des interactions**
- Statuts visuels (en attente/accepté/refusé)
- **Interface de gestion de la messagerie intégrée au dashboard**
- **Section dédiée aux certifications pour les centres certificateurs**
- Accès rapide aux actions principales (recherche, messages)
- Historique filtrable par date/statut

#### Feature 4.2 : Dashboard Jury Professionnel
**Description :** Interface de gestion pour les jurys

**User Stories :**
- En tant que jury, j'accède à un tableau de bord personnalisé
- *En tant que jury, je vois clairement mon statut de validation*
- En tant que jury, je vois la liste des demandes reçues
- En tant que jury, j'accède à l'historique de mes missions
- *En tant que jury, je peux consulter mes avis et notes reçus*
- En tant que jury, je peux modifier mon profil facilement

**Critères d'acceptation :**
- *Statut de validation visible en permanence ("En attente" / "Validé")*
- Actions rapides pour accepter/refuser les demandes
- *Affichage des avis avec note moyenne*
- Profil modifiable via lien direct

---

### EPIC 5 : Gestion Avancée des Centres de Formation

#### Feature 5.1 : Tableau de Bord Centres Avancé
**Description :** Interface complète de gestion pour les centres de formation

**User Stories :**
- **En tant que centre, je vois la liste complète des jurys contactés avec leur statut**
- **En tant que centre, je gère ma messagerie interne depuis une interface dédiée**
- **En tant que centre certificateur, j'accède à la liste de mes certifications rattachées via France Compétence**
- **En tant que centre, je peux filtrer mes contacts par statut, date, domaine**
- **En tant que centre, je peux exporter la liste de mes contacts jurys**

**Critères d'acceptation :**
- **Vue tabulaire des jurys contactés avec colonnes : nom, domaine, date contact, statut, dernière interaction**
- **Interface de messagerie avec liste des conversations actives**
- **Section certifications avec synchronisation API France Compétence**
- **Filtres avancés : statut, période, domaine de certification**
- **Export CSV/PDF des listes de contacts**

#### Feature 5.2 : Messagerie Avancée
**Description :** Système de messagerie interne complet pour les centres

**User Stories :**
- **En tant que centre, je peux initier une conversation avec un jury depuis son profil**
- **En tant que centre, je peux voir toutes mes conversations en cours**
- **En tant que centre, je peux marquer des messages comme importants**
- **En tant que centre, je peux archiver des conversations terminées**

**Critères d'acceptation :**
- **Interface de messagerie avec liste des conversations et zone de chat**
- **Indicateurs visuels : non lu, important, archivé**
- **Recherche dans l'historique des messages**
- **Notifications push pour nouveaux messages**

#### Feature 5.3 : Gestion des Certifications
**Description :** Interface de gestion des certifications pour les centres certificateurs

**User Stories :**
- **En tant que centre certificateur, je peux synchroniser mes certifications avec France Compétence**
- **En tant que centre certificateur, je peux voir le détail de chaque certification**
- **En tant que centre certificateur, je peux associer des jurys à des certifications spécifiques**
- **En tant que centre certificateur, je reçois des alertes sur les mises à jour de certifications**

**Critères d'acceptation :**
- **API France Compétence intégrée avec synchronisation automatique**
- **Affichage des certifications avec statut, validité, domaines**
- **Possibilité d'associer jurys et certifications**
- **Notifications automatiques des changements de statut**

---

### EPIC 6 : Administration & Modération

#### Feature 5.1 : Tableau de Bord Administrateur
**Description :** Interface de supervision globale de la plateforme

**User Stories :**
- En tant qu'admin, j'accède aux statistiques globales (utilisateurs, mises en relation)
- En tant qu'admin, je vois les profils en attente de validation
- En tant qu'admin, je peux exporter des statistiques
- En tant qu'admin, je peux gérer les signalements

**Critères d'acceptation :**
- Métriques clés : nb jurys, nb centres, nb mises en relation, taux de conversion
- *Notifications admin pour chaque nouveau profil à valider*
- Export CSV des données statistiques
- Interface de gestion des incidents

#### Feature 5.2 : Validation des Profils Jurys
**Description :** Processus de validation manuelle des jurys

**User Stories :**
- *En tant qu'admin, je peux valider ou refuser un profil jury après vérification des informations saisies*
- *En tant qu'admin, je peux consulter tous les détails d'un profil jury*
- *En tant qu'admin, je peux laisser un commentaire en cas de refus*
- *En tant que jury, je reçois une notification de validation ou refus avec les raisons*

**Critères d'acceptation :**
- *Processus de validation basé sur la cohérence des informations saisies*
- Liste paginée des profils en attente
- *Actions : Valider / Refuser avec commentaire obligatoire si refus*
- *Email automatique de confirmation avec raisons en cas de refus*

#### Feature 5.3 : Gestion des Utilisateurs
**Description :** Outils d'administration des comptes utilisateurs

**User Stories :**
- En tant qu'admin, je peux voir la liste de tous les utilisateurs
- En tant qu'admin, je peux suspendre ou supprimer un compte
- En tant qu'admin, je peux filtrer par rôle (centre/jury)
- En tant qu'admin, je peux rechercher par nom/email

**Critères d'acceptation :**
- Interface de recherche et filtrage
- Actions de modération avec confirmation
- Logs d'activité pour traçabilité
- Possibilité de réactivation des comptes suspendus

---

### EPIC 7 : Système d'Évaluation

#### Feature 6.1 : Avis et Notations
**Description :** Permettre l'évaluation des jurys après les missions

**User Stories :**
- En tant que centre, je peux laisser un avis après une mission réalisée
- *En tant que centre, je peux noter de 1 à 5 étoiles le jury*
- En tant que centre, je peux ajouter un commentaire à mon évaluation
- *En tant que jury, je peux voir mes avis mais l'identité du centre reste masquée*
- *En tant que jury, je vois ma note moyenne globale*

**Critères d'acceptation :**
- *Système de notation simple : 1 à 5 étoiles*
- 1 seul avis par mission
- *Anonymisation automatique du nom du centre*
- Modération possible par l'admin
- *Calcul automatique de la moyenne des notes*

#### Feature 6.2 : Affichage des Réputations
**Description :** Intégrer les évaluations dans l'expérience utilisateur

**User Stories :**
- En tant que centre, je peux voir la note moyenne d'un jury avant de le contacter
- En tant que jury, je peux voir ma réputation dans mon profil
- En tant qu'utilisateur, je peux signaler un avis inapproprié

**Critères d'acceptation :**
- Note moyenne visible sur les cartes de recherche
- Affichage du nombre total d'avis
- Possibilité de signalement avec modération admin
- Pas d'affichage si moins de 3 avis

---

### EPIC 8 : Modèle Freemium

#### Feature 7.1 : Limitations Freemium
**Description :** Mettre en place les restrictions de l'offre gratuite

**User Stories :**
- En tant que centre freemium, je ne peux contacter qu'un seul jury
- En tant que centre freemium, je vois les limitations de mon compte
- En tant que centre freemium, je suis incité à passer en version Pro
- En tant qu'utilisateur, je peux consulter la grille tarifaire

**Critères d'acceptation :**
- Compteur visible de contacts utilisés (0/1)
- Messages d'encouragement vers la version Pro
- Blocage technique après 1 contact
- Page dédiée à la grille tarifaire (sans paiement actif)

#### Feature 7.2 : Appels à l'Action Premium
**Description :** Encourager la conversion vers l'offre payante

**User Stories :**
- En tant que centre, je vois des boutons "Passer au Pro" dans l'interface
- En tant que centre, je peux voir les avantages de la version Pro
- En tant que centre, je suis dirigé vers une page d'information (sans paiement)

**Critères d'acceptation :**
- CTA visibles sans être intrusifs
- Page de comparaison freemium vs Pro
- Collecte d'intérêt pour la version payante (email/contact)

---

## 🎨 Spécifications UX/UI

### Design System
- **Couleurs :** Bleu #0d4a70, Menthe #13d090, Jaune #fdce0f, Violet #bea1e5
- **Typographie :** Plus Jakarta Sans
- **Icônes :** Style plein arrondi
- **Responsive :** Mobile-first, compatible tablettes et desktop

### Principes d'Ergonomie
- Interface épurée et professionnelle
- Navigation intuitive avec fil d'Ariane
- Temps de chargement optimisés
- Accessibilité WCAG AA
- Messages d'erreur clairs et constructifs

---

## 🔒 Exigences Non-Fonctionnelles

### Sécurité
- Conformité RGPD
- Chiffrement des données sensibles
- Authentification sécurisée
- Logs d'accès et d'activité
- Sauvegarde quotidienne

### Performance
- Temps de réponse < 2 secondes
- Disponibilité 99.5%
- Optimisation SEO de base
- Compression des images

### Compatibilité
- Navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions)
- Mobile : iOS 12+, Android 8+
- Responsive design complet

---

## 📊 Métriques de Succès

### Métriques d'Adoption
- Nombre d'inscriptions jurys/centres par semaine
- Taux de validation des profils jurys
- Taux d'utilisation de la mise en relation gratuite

### Métriques d'Engagement
- Taux de réponse des jurys aux demandes
- Temps moyen entre demande et réponse
- Nombre de messages échangés par mise en relation

### Métriques Business
- Taux de conversion vers la version Pro (intention)
- Note moyenne des avis
- Taux de rétention à 30 jours

---

## 🚀 Roadmap de Livraison

### Phase 1 (Semaines 1-2) : Fondations
- Authentification et gestion des profils
- Structure de base des tableaux de bord

### Phase 2 (Semaines 3-4) : Fonctionnalités Cœur
- Moteur de recherche et mise en relation
- Messagerie et notifications
- Interface d'administration

### Phase 3 (Semaine 5) : Finalisation
- Système d'évaluation
- Optimisations UX/UI
- Tests finaux et déploiement

---

## 📋 Livrables

### Plateforme Fonctionnelle
- Application web déployée en production
- 3 comptes de test configurés (admin/centre/jury)
- Données de test pour démonstration

### Documentation
- Guide d'utilisation administrateur
- Documentation technique
- Formation administration (1h visioconférence)

### Code Source
- Repository GitHub privé
- Code commenté et documenté
- Instructions de déploiement

---

*Note : Les éléments en italique correspondent aux décisions temporaires sujettes à révision et facilement identifiables pour mise à jour.*