# SimplyJury - Tâches Techniques et Fonctionnelles par Épique

*Version 3.0 - Scope MVP Final Validé par le Client*

**NOTE IMPORTANTE :** Cette version ne contient QUE les tâches confirmées dans le périmètre MVP validé. Tous les éléments hors scope et ambigus ont été exclus.

---

## 📋 **ÉPIQUE 1 : Authentification & Gestion des Comptes**

### 🔧 **Tâches Techniques**
- **T1.1** - Configuration de l'authentification Supabase Auth
- **T1.2** - Implémentation du système de rôles (RBAC) avec types `training_center` / `jury_professional`
- **T1.3** - Configuration du service d'envoi d'emails (Resend) pour les confirmations
- **T1.4** - Mise en place de la validation côté serveur des formulaires
- **T1.5** - Configuration des politiques RLS (Row Level Security) Supabase
- **T1.6** - Implémentation de la sécurisation des sessions utilisateurs

### ✅ **Tâches Fonctionnelles**
- **F1.1** - Créer le formulaire d'inscription avec sélection de rôle (Centre/Jury)
- **F1.2** - Développer la page de connexion sécurisée (email + mot de passe)
- **F1.3** - Implémenter la fonctionnalité de réinitialisation de mot de passe
- **F1.4** - Créer le système de confirmation d'inscription par email
- **F1.5** - Développer la gestion des erreurs d'authentification
- **F1.6** - Tester les parcours utilisateurs complets d'inscription/connexion

---

## 👤 **ÉPIQUE 2 : Profils Utilisateurs**

### 🔧 **Tâches Techniques**
- **T2.1** - Intégration de l'API Pappers pour l'auto-complétion SIRET et validation Qualiopi
- **T2.2** - Configuration du stockage et optimisation des images de profil
- **T2.3** - Configuration de la validation automatique des profils centres via SIRET
- **T2.4** - Intégration de l'API France Compétences pour le rattachement des certifications
- **T2.5** - Implémentation du système de validation des documents jurys

### ✅ **Tâches Fonctionnelles - Profil Centre de Formation**
- **F2.1** - Créer le formulaire de profil Centre avec auto-complétion SIRET/SIREN
- **F2.2** - Implémenter l'affichage automatique du statut Qualiopi
- **F2.3** - Développer la checkbox "Centre certificateur" dans le profil
- **F2.4** - Créer l'interface de rattachement des certifications via API France Compétences (pour centres certificateurs)
- **F2.5** - Implémenter la modification des informations de contact
- **F2.6** - Créer la page "Mes certifications rattachées" (centres certificateurs uniquement)

### ✅ **Tâches Fonctionnelles - Profil Jury Professionnel**
- **F2.7** - Créer le formulaire de profil Jury complet (nom, photo, région, expertise)
- **F2.8** - Implémenter l'upload et prévisualisation de photo de profil
- **F2.9** - Développer la section diplômes et expériences avec années
- **F2.10** - Créer le système de définition des disponibilités (checkboxes/calendrier)
- **F2.11** - Implémenter la sélection des modalités (visio/présentiel/les deux)
- **F2.12** - Développer la zone d'intervention (départements/régions)
- **F2.13** - Créer l'interface de visualisation des avis et note moyenne
- **F2.14** - Implémenter les statuts de validation (En attente/Validé/Suspendu)

---

## 🔍 **ÉPIQUE 3 : Recherche et Filtrage**

### 🔧 **Tâches Techniques**
- **T3.1** - Configuration de l'indexation de recherche full-text avec Supabase
- **T3.2** - Optimisation des requêtes de recherche et mise en cache
- **T3.3** - Configuration de la pagination performante pour les résultats

### ✅ **Tâches Fonctionnelles**
- **F3.1** - Créer l'interface de recherche de jurys avec filtres (domaine, région, modalités)
- **F3.2** - Développer l'affichage des résultats sous forme de cartes jurys
- **F3.3** - Implémenter l'affichage des notes moyennes et avis sur les cartes
- **F3.4** - Créer les boutons d'action "Voir profil" et "Contacter"
- **F3.5** - Implémenter la pagination des résultats (12 par page)
- **F3.6** - Tester les performances de recherche

---

## 💬 **ÉPIQUE 4 : Système de Mise en Relation et Messagerie**

### 🔧 **Tâches Techniques**
- **T4.1** - Configuration des templates d'emails transactionnels (Resend)
- **T4.2** - Mise en place de la messagerie interne texte uniquement
- **T4.3** - Implémentation du système de notifications email
- **T4.4** - Configuration du système de limitation freemium (1 contact gratuit)
- **T4.5** - Implémentation du système d'historique des demandes

### ✅ **Tâches Fonctionnelles - Demandes Structurées**
- **F4.1** - Créer le formulaire de demande structurée (centres vers jurys)
- **F4.2** - Implémenter les champs : certification visée, dates, nombre candidats, modalités, frais
- **F4.3** - Développer l'interface de réception des demandes côté jury
- **F4.4** - Créer les actions accepter/refuser pour les jurys
- **F4.5** - Implémenter le système de limitation freemium (1 demande gratuite)

### ✅ **Tâches Fonctionnelles - Messagerie**
- **F4.6** - Développer la messagerie texte 1-to-1 simple
- **F4.7** - Implémenter les demandes de contact via messagerie (jury vers centre)
- **F4.8** - Créer la fonctionnalité de transformation message en demande structurée
- **F4.9** - Développer les notifications email pour nouveaux messages
- **F4.10** - Créer l'historique complet des conversations
- **F4.11** - Implémenter les indicateurs lu/non lu

---

## 📊 **ÉPIQUE 5 : Tableaux de Bord**

### 🔧 **Tâches Techniques**
- **T5.1** - Implémentation des requêtes d'agrégation pour les statistiques
- **T5.2** - Configuration du cache pour les données des tableaux de bord
- **T5.3** - Optimisation des performances pour le chargement des dashboards
- **T5.4** - Implémentation du système de navigation par rôle

### ✅ **Tâches Fonctionnelles - Dashboard Administrateur**
- **F5.1** - Créer l'interface d'administration complète avec sidebar dédiée
- **F5.2** - Développer le tableau de bord admin avec statistiques globales
- **F5.3** - Implémenter la section de validation des profils jurys
- **F5.4** - Créer l'interface de gestion des utilisateurs
- **F5.5** - Développer les actions valider/refuser avec motifs

### ✅ **Tâches Fonctionnelles - Dashboard Centre de Formation**
- **F5.6** - Créer l'interface Centre avec alert freemium (1 contact restant)
- **F5.7** - Développer le tableau de bord avec liste des jurys contactés
- **F5.8** - Implémenter la gestion de la messagerie intégrée
- **F5.9** - Créer l'accès à la liste des certifications rattachées (centres certificateurs)
- **F5.10** - Développer l'affichage des statuts des demandes (attente/accepté/refusé)
- **F5.11** - Créer l'historique des sessions réalisées

### ✅ **Tâches Fonctionnelles - Dashboard Jury Professionnel**
- **F5.12** - Créer l'interface Jury avec badge de statut de validation
- **F5.13** - Développer la gestion des demandes reçues avec actions rapides
- **F5.14** - Implémenter l'interface de messagerie jury
- **F5.15** - Créer l'historique des missions réalisées
- **F5.16** - Développer l'interface de consultation des évaluations reçues
- **F5.17** - Implémenter la page de modification du profil jury

---

## ⭐ **ÉPIQUE 6 : Système d'Avis et Notation**

### 🔧 **Tâches Techniques**
- **T6.1** - Implémentation du calcul automatique des notes moyennes
- **T6.2** - Mise en place de l'anonymisation des avis (nom centre masqué)
- **T6.3** - Configuration des contraintes (1 avis max par mission/centre)

### ✅ **Tâches Fonctionnelles**
- **F6.1** - Créer le formulaire d'évaluation (1-5 étoiles + commentaire)
- **F6.2** - Développer l'affichage des notes moyennes sur les cartes profils
- **F6.3** - Implémenter l'interface de consultation des avis pour les jurys
- **F6.4** - Développer la validation automatique des avis
- **F6.5** - Tester l'intégrité du système de notation

---

## 💰 **ÉPIQUE 7 : Modèle Freemium**

### 🔧 **Tâches Techniques**
- **T7.1** - Configuration du système de limitation des contacts
- **T7.2** - Implémentation du compteur de contacts utilisés
- **T7.3** - Configuration des restrictions d'accès post-limitation

### ✅ **Tâches Fonctionnelles**
- **F7.1** - Implémenter la limitation à 1 mise en relation gratuite par centre
- **F7.2** - Créer les alertes visuelles de limitation (contact restant)
- **F7.3** - Développer le verrouillage après utilisation du contact gratuit
- **F7.4** - Créer les CTA "Passer au Pro" sur les fonctionnalités verrouillées
- **F7.5** - Implémenter l'affichage de la grille tarifaire
- **F7.6** - Développer les pages d'information sur le plan Pro

---

## 🔐 **ÉPIQUE 8 : Administration**

### 🔧 **Tâches Techniques**
- **T8.1** - Configuration des rôles et permissions administrateur
- **T8.2** - Configuration des sauvegardes automatiques base de données
- **T8.3** - Configuration de l'environnement de staging pour les tests

### ✅ **Tâches Fonctionnelles**
- **F8.1** - Créer le panneau d'administration avec vue d'ensemble
- **F8.2** - Développer l'interface de validation manuelle des profils jurys
- **F8.3** - Implémenter les notifications email de validation/refus avec motifs
- **F8.4** - Créer les actions de gestion des comptes (suspendre/supprimer)
- **F8.5** - Tester les droits d'accès et la sécurité

---

## 🖥️ **ÉPIQUE 9 : Pages et Interfaces**

### 🔧 **Tâches Techniques**
- **T9.1** - Configuration du routage par rôle avec protection des accès
- **T9.2** - Implémentation des composants réutilisables
- **T9.3** - Mise en place de la pagination pour les listes longues

### ✅ **Tâches Fonctionnelles - Pages Administrateur**
- **F9.1** - Créer la page "Validation profils" avec détails des jurys
- **F9.2** - Développer la page "Gestion utilisateurs" avec recherche et filtres

### ✅ **Tâches Fonctionnelles - Pages Centre de Formation**
- **F9.3** - Créer la page "Rechercher un jury" avec filtres et résultats
- **F9.4** - Développer la page "Mes demandes" avec statuts et historique
- **F9.5** - Implémenter la page "Messagerie" avec conversations
- **F9.6** - Créer la page "Sessions réalisées" avec détails
- **F9.7** - Développer la page "Avis donnés" avec historique des notations
- **F9.8** - Créer la page "Mes certifications" (centres certificateurs uniquement)
- **F9.9** - Implémenter la page "Passer au Pro" avec avantages

### ✅ **Tâches Fonctionnelles - Pages Jury Professionnel**
- **F9.10** - Créer la page "Mes demandes" avec gestion acceptation/refus
- **F9.11** - Développer la page "Messagerie" jury
- **F9.12** - Implémenter la page "Missions réalisées" avec historique
- **F9.13** - Créer la page "Mes évaluations" avec avis reçus
- **F9.14** - Développer la page "Mon profil" avec édition complète

### ✅ **Tâches Fonctionnelles - Pages Communes**
- **F9.15** - Créer les pages d'erreur personnalisées (404, 500)
- **F9.16** - Développer les modales de confirmation
- **F9.17** - Créer les pages de chargement avec skeletons
- **F9.18** - Tester la navigation et cohérence UX

---

## 🚀 **Tâches Transversales de Déploiement**

### 🔧 **Tâches Techniques Critiques**
- **TD.1** - Configuration des environnements dev/staging/production
- **TD.2** - Mise en place du CI/CD automatisé (Vercel + GitHub)
- **TD.3** - Configuration HTTPS et sécurité (RGPD, chiffrement données)
- **TD.4** - Tests de charge et optimisation des performances

### ✅ **Tâches Fonctionnelles de Livraison**
- **FD.1** - Tests utilisateurs complets sur les 3 interfaces (admin, centre, jury)
- **FD.2** - Configuration de 3 comptes de test avec données exemple
- **FD.3** - Vérification de la responsivité mobile et desktop
- **FD.4** - Tests d'intégration avec APIs externes (Pappers, France Compétences)
- **FD.5** - Validation finale client sur toutes les fonctionnalités
- **FD.6** - Formation administration (1h visioconférence)

---

## 📋 **Récapitulatif Final du Scope MVP**

### **NOUVELLES FONCTIONNALITÉS AJOUTÉES :**
1. **Centre Certificateur** : Checkbox dans le profil + rattachement certifications
2. **API France Compétences** : Intégration pour le rattachement des certifications
3. **Page "Mes Certifications"** : Accessible uniquement aux centres certificateurs
4. **Messagerie Bidirectionnelle** : Jury peut initier contact + transformation en demande
5. **Tableaux de Bord Enrichis** : Accès aux certifications rattachées pour centres certificateurs

### **PÉRIMÈTRE TECHNIQUE CONFIRMÉ :**
- **Stack** : Next.js 14 + TypeScript + Supabase + Tailwind CSS
- **APIs Externes** : Pappers (SIRET) + France Compétences (certifications)
- **Messagerie** : Texte uniquement, sans pièces jointes
- **Freemium** : 1 contact gratuit par centre
- **Design** : Responsive mobile + desktop

### **LIVRABLES GARANTIS :**
- Plateforme fonctionnelle déployée en production
- 3 comptes de test configurés (admin/centre certificateur/jury)
- Documentation technique complète
- Formation administration (1h)
- Code source livré

---

**TOTAL : 95 tâches confirmées dans le scope MVP final**

*Document de suivi projet - Version 3.0 du 29/08/2025*  
*Scope MVP définitif validé par le client - Prêt pour développement*