# Plan de Tests Manuels - EPIC 01 : Gestion des Utilisateurs & Authentification

## 📋 Informations Générales

**Epic :** EPIC 01 - Gestion des Utilisateurs & Authentification  
**Version :** 2.0  
**Date de mise à jour :** 2025-01-24  
**Environnement de test :** http://localhost:3000  
**Base de données :** Supabase (projet: vbnnjwgfbadvqavqnlhh)  
**Service d'emails :** Resend

---

## 🎯 Objectifs des Tests

Valider l'implémentation complète des fonctionnalités d'authentification, gestion des profils utilisateurs et système d'emails transactionnels avec Resend selon les spécifications de l'Epic 01.

### ✅ Système d'Authentification Existant
Le boilerplate inclut déjà :
- Pages `/sign-up` et `/sign-in` fonctionnelles
- Hachage bcrypt + sessions JWT
- Gestion d'équipes multi-tenant
- Server Actions Next.js

### 🔧 Extensions à Tester
- Intégration Resend pour emails transactionnels
- Vérification d'email obligatoire
- Réinitialisation de mot de passe
- Types d'utilisateurs (centre/jury)
- Validation admin des profils

---

## 🧪 Tests Unitaires

### TEST-01-001 : Inscription Utilisateur - Centre de Formation

**Objectif :** Valider la création d'un compte centre de formation

**Prérequis :**
- Application démarrée sur http://localhost:3000
- Base de données vide ou nettoyée
- Email de test disponible (ex: test-centre@example.com)

**Étapes :**
1. Naviguer vers `/sign-up`
2. Sélectionner le type "Centre de formation"
3. Saisir les informations :
   - Nom complet : "Centre Formation Test"
   - Email : "test-centre@example.com"
   - Mot de passe : "TestPassword123!"
   - Confirmer mot de passe : "TestPassword123!"
4. Cliquer sur "Créer mon compte"

**Résultats attendus :**
- ✅ Message de confirmation affiché : "Compte créé avec succès. Veuillez vérifier votre email."
- ✅ Redirection vers `/sign-in?message=verification-sent`
- ✅ Utilisateur créé en base avec `user_type = 'centre'`
- ✅ `email_verified = false`
- ✅ `email_verification_token` généré
- ✅ `validation_status = 'pending'`
- ✅ **Email de bienvenue envoyé via Resend**
- ✅ **Email de vérification envoyé via Resend**

**Critères de validation :**
- [ ] Interface utilisateur conforme au design
- [ ] Validation des champs fonctionnelle
- [ ] Données correctement stockées en base
- [ ] Tokens de sécurité générés
- [ ] **Email de bienvenue reçu avec contenu personnalisé**
- [ ] **Email de vérification reçu avec lien valide**
- [ ] **Templates Resend correctement rendus**

---

### TEST-01-002 : Inscription Utilisateur - Jury Professionnel

**Objectif :** Valider la création d'un compte jury professionnel

**Prérequis :**
- Application démarrée
- Email de test disponible (ex: test-jury@example.com)

**Étapes :**
1. Naviguer vers `/sign-up`
2. Sélectionner le type "Jury professionnel"
3. Saisir les informations :
   - Nom complet : "Jean Dupont"
   - Email : "test-jury@example.com"
   - Mot de passe : "JuryPassword123!"
   - Confirmer mot de passe : "JuryPassword123!"
4. Cliquer sur "Créer mon compte"

**Résultats attendus :**
- ✅ Message de confirmation affiché
- ✅ Redirection vers page de connexion
- ✅ Utilisateur créé avec `user_type = 'jury'`
- ✅ Token de vérification email généré
- ✅ **Email de bienvenue jury personnalisé envoyé**
- ✅ **Email de vérification envoyé**

**Critères de validation :**
- [ ] Type d'utilisateur correctement défini
- [ ] Workflow d'inscription identique aux centres
- [ ] Données persistées correctement
- [ ] **Contenu email adapté au type "jury professionnel"**
- [ ] **Liens de vérification fonctionnels**

---

### TEST-01-003 : Validation des Mots de Passe

**Objectif :** Vérifier les règles de complexité des mots de passe

**Cas de test :**

| Mot de passe | Résultat attendu | Raison |
|--------------|------------------|---------|
| "123456" | ❌ Rejeté | Trop court, pas de lettres |
| "password" | ❌ Rejeté | Pas de majuscule, pas de chiffre |
| "Password" | ❌ Rejeté | Pas de chiffre |
| "Password123" | ✅ Accepté | Conforme aux règles |
| "Motdepasse123!" | ✅ Accepté | Conforme avec caractère spécial |

**Étapes pour chaque cas :**
1. Aller sur `/sign-up`
2. Saisir le mot de passe à tester
3. Tenter de soumettre le formulaire

**Critères de validation :**
- [ ] Messages d'erreur explicites pour chaque règle
- [ ] Validation côté client (temps réel)
- [ ] Validation côté serveur (sécurité)

---

### TEST-01-004 : Vérification Email via Resend

**Objectif :** Valider le processus de vérification d'email avec templates Resend

**Prérequis :**
- Compte créé avec token de vérification
- Accès à une boîte email de test (ex: MailHog, Mailtrap)
- Variable `RESEND_API_KEY` configurée

**Étapes :**
1. Créer un compte (TEST-01-001)
2. **Vérifier la réception de l'email de vérification**
3. **Cliquer sur le lien dans l'email reçu**
4. Vérifier la redirection vers la page de confirmation
5. Tenter de se connecter avec le compte vérifié

**Résultats attendus :**
- ✅ **Email reçu avec template Resend professionnel**
- ✅ **Lien de vérification fonctionnel dans l'email**
- ✅ Redirection vers `/email-verified?success=true`
- ✅ `email_verified = true` en base
- ✅ `email_verification_token = null` en base
- ✅ **Message de confirmation stylisé**

**Critères de validation :**
- [ ] **Template email professionnel et responsive**
- [ ] **Lien de vérification sécurisé (HTTPS)**
- [ ] Token valide accepté
- [ ] Token invalide rejeté avec message d'erreur
- [ ] Token expiré rejeté (après 24h)
- [ ] **Branding SimplyJury dans l'email**
- [ ] **Instructions claires en français**

---

### TEST-01-005 : Connexion Utilisateur

**Objectif :** Valider l'authentification des utilisateurs

**Prérequis :**
- Compte centre créé et email vérifié
- Identifiants : test-centre@example.com / TestPassword123!

**Étapes :**
1. Naviguer vers `/sign-in`
2. Saisir email : "test-centre@example.com"
3. Saisir mot de passe : "TestPassword123!"
4. Cliquer sur "Se connecter"

**Résultats attendus :**
- ✅ Redirection vers `/dashboard` (centre) ou `/jury-dashboard` (jury)
- ✅ Cookie `auth-token` défini (HttpOnly, Secure)
- ✅ `last_login` mis à jour en base
- ✅ Session utilisateur active

**Critères de validation :**
- [ ] Authentification réussie avec bons identifiants
- [ ] Rejet avec mauvais identifiants
- [ ] Redirection selon le type d'utilisateur
- [ ] Sécurité des cookies

---

### TEST-01-006 : Connexion - Email Non Vérifié

**Objectif :** Vérifier le blocage des comptes non vérifiés

**Prérequis :**
- Compte créé mais email non vérifié

**Étapes :**
1. Créer un compte sans vérifier l'email
2. Tenter de se connecter avec ces identifiants

**Résultats attendus :**
- ❌ Connexion refusée
- ✅ Message : "Veuillez vérifier votre email avant de vous connecter"
- ✅ Pas de cookie de session créé

**Critères de validation :**
- [ ] Blocage effectif des comptes non vérifiés
- [ ] Message d'erreur explicite
- [ ] Possibilité de renvoyer l'email de vérification

---

### TEST-01-007 : Réinitialisation Mot de Passe avec Resend

**Objectif :** Valider le processus de réinitialisation avec emails Resend

**Prérequis :**
- Compte existant avec email vérifié
- Service Resend configuré

**Étapes :**
1. Naviguer vers `/forgot-password`
2. Saisir email : "test-centre@example.com"
3. Cliquer sur "Envoyer le lien de réinitialisation"
4. **Vérifier la réception de l'email de réinitialisation**
5. **Cliquer sur le lien dans l'email reçu**
6. Saisir nouveau mot de passe : "NewPassword123!"
7. Confirmer le nouveau mot de passe
8. Soumettre le formulaire
9. **Vérifier la possibilité de connexion avec le nouveau mot de passe**

**Résultats attendus :**
- ✅ Message affiché : "Si cet email existe, un lien de réinitialisation a été envoyé"
- ✅ **Email de réinitialisation reçu via Resend**
- ✅ **Template professionnel avec instructions claires**
- ✅ Token généré en base avec expiration 1h (sécurité renforcée)
- ✅ Page de réinitialisation accessible avec token valide
- ✅ Mot de passe mis à jour en base avec hachage bcrypt
- ✅ Token de réinitialisation supprimé après usage
- ✅ **Connexion possible avec nouveau mot de passe**

**Critères de validation :**
- [ ] **Email reçu avec design professionnel**
- [ ] **Lien de réinitialisation sécurisé**
- [ ] **Expiration courte du token (1h max)**
- [ ] Génération correcte du token cryptographiquement sûr
- [ ] Validation de l'expiration du token
- [ ] Mise à jour sécurisée du mot de passe
- [ ] Nettoyage des tokens après usage
- [ ] **Message de sécurité dans l'email (si pas vous, ignorez)**
- [ ] **Conseils de sécurité pour le nouveau mot de passe**

---

### TEST-01-008 : Profil Centre de Formation - Création

**Objectif :** Valider la création du profil centre avec SIRET

**Prérequis :**
- Compte centre connecté
- SIRET de test valide : "12345678901234" (ou SIRET réel pour test API)

**Étapes :**
1. Se connecter en tant que centre
2. Naviguer vers `/profile/center`
3. Saisir les informations :
   - SIRET : "12345678901234"
   - Nom établissement : "Centre Formation Test"
   - Email : "contact@centre-test.fr"
   - Téléphone : "0123456789"
   - Personne responsable : "Marie Martin"
   - Rôle responsable : "Directrice pédagogique"
   - Domaines de certification : ["Informatique", "Gestion"]
4. Cocher "Centre certificateur" : Non
5. Soumettre le formulaire

**Résultats attendus :**
- ✅ Profil créé en table `training_centers`
- ✅ `profile_completed = true` pour l'utilisateur
- ✅ Redirection vers le dashboard
- ✅ Données correctement stockées

**Critères de validation :**
- [ ] Validation du format SIRET
- [ ] Auto-complétion via API INSEE (si configurée)
- [ ] Sauvegarde complète des données
- [ ] Interface utilisateur intuitive

---

### TEST-01-009 : Profil Centre Certificateur

**Objectif :** Valider les fonctionnalités spécifiques aux centres certificateurs

**Prérequis :**
- Compte centre connecté

**Étapes :**
1. Créer un profil centre (TEST-01-008)
2. Modifier le profil pour cocher "Centre certificateur"
3. Sauvegarder les modifications
4. Vérifier l'accès aux fonctionnalités certificateur

**Résultats attendus :**
- ✅ `is_certificateur = true` en base
- ✅ Section "Mes certifications" visible dans le dashboard
- ✅ Accès à la synchronisation France Compétence
- ✅ Fonctionnalités avancées activées

**Critères de validation :**
- [ ] Checkbox certificateur fonctionnelle
- [ ] Activation conditionnelle des fonctionnalités
- [ ] Interface adaptée au statut certificateur

---

### TEST-01-010 : Profil Jury Professionnel - Création

**Objectif :** Valider la création du profil jury

**Prérequis :**
- Compte jury connecté

**Étapes :**
1. Se connecter en tant que jury
2. Naviguer vers `/profile/jury`
3. Saisir les informations :
   - Prénom : "Jean"
   - Nom : "Dupont"
   - Région : "Île-de-France"
   - Domaines d'expertise : ["Informatique", "Réseaux"]
   - Certifications : ["CISSP", "CISA"]
   - Années d'expérience : 10
   - Poste actuel : "Consultant IT"
   - Modalités de travail : ["visio", "presentiel"]
   - Zones d'intervention : ["Île-de-France", "Hauts-de-France"]
   - Tarif horaire : 150.00
   - Bio : "Expert en sécurité informatique..."
4. Uploader une photo de profil (optionnel)
5. Soumettre le formulaire

**Résultats attendus :**
- ✅ Profil créé en table `jury_profiles`
- ✅ `profile_completed = true` pour l'utilisateur
- ✅ `validation_status = 'pending'` (en attente validation admin)
- ✅ Photo uploadée et redimensionnée (si fournie)

**Critères de validation :**
- [ ] Tous les champs obligatoires validés
- [ ] Upload et traitement des images
- [ ] Sauvegarde des préférences complexes
- [ ] Statut de validation correct

---

### TEST-01-011 : Validation Admin - Profil Jury avec Notification Resend

**Objectif :** Valider le processus de validation administrateur avec emails automatiques

**Prérequis :**
- Compte admin créé
- Profil jury en attente de validation
- Service Resend configuré

**Étapes :**
1. Se connecter en tant qu'admin
2. Naviguer vers `/admin/validation`
3. Voir la liste des profils en attente
4. Cliquer sur le profil jury à valider
5. Examiner les détails du profil
6. Cliquer sur "Valider le profil"
7. **Vérifier l'envoi automatique de l'email de validation**
8. **Contrôler la réception de l'email par le jury**

**Résultats attendus :**
- ✅ Liste des profils en attente visible
- ✅ Détails complets du profil affichés
- ✅ `validation_status = 'approved'` après validation
- ✅ **Email de validation envoyé automatiquement via Resend**
- ✅ **Template "Profil validé" professionnel reçu**
- ✅ Profil accessible dans les recherches
- ✅ **Lien vers le dashboard dans l'email**

**Critères de validation :**
- [ ] Interface admin fonctionnelle
- [ ] Processus de validation complet
- [ ] **Email automatique envoyé immédiatement**
- [ ] **Template de validation professionnel**
- [ ] **Message de félicitations personnalisé**
- [ ] **Instructions pour les prochaines étapes**
- [ ] Mise à jour des statuts
- [ ] **Logs d'envoi d'email dans l'admin**

---

### TEST-01-012 : Validation Admin - Refus de Profil avec Email Personnalisé

**Objectif :** Valider le processus de refus avec commentaire et email explicatif

**Prérequis :**
- Profil jury en attente de validation
- Service Resend configuré

**Étapes :**
1. Se connecter en tant qu'admin
2. Aller sur le profil à refuser
3. Cliquer sur "Refuser le profil"
4. Saisir un commentaire : "Informations incomplètes sur les certifications. Merci de préciser vos certifications CISSP et d'ajouter les justificatifs."
5. Confirmer le refus
6. **Vérifier l'envoi automatique de l'email de refus**
7. **Contrôler le contenu de l'email reçu par le jury**

**Résultats attendus :**
- ✅ `validation_status = 'rejected'`
- ✅ `validation_comment` sauvegardé
- ✅ **Email de refus envoyé automatiquement via Resend**
- ✅ **Template "Profil à corriger" avec commentaires admin**
- ✅ Profil non visible dans les recherches
- ✅ **Lien vers l'édition du profil dans l'email**
- ✅ **Instructions pour la re-soumission**

**Critères de validation :**
- [ ] Commentaire obligatoire pour refus
- [ ] **Email automatique avec ton bienveillant**
- [ ] **Commentaires admin intégrés dans l'email**
- [ ] **Instructions claires pour les corrections**
- [ ] **Lien direct vers l'édition du profil**
- [ ] Possibilité de re-soumission après correction
- [ ] **Template professionnel et encourageant**
- [ ] **Contact support disponible dans l'email**

---

### TEST-01-013 : API SIRET - Validation et Auto-complétion

**Objectif :** Valider l'intégration API INSEE SIRET

**Prérequis :**
- Token API INSEE configuré
- SIRET valide pour test

**Étapes :**
1. Créer un profil centre
2. Saisir un SIRET valide
3. Déclencher la validation automatique
4. Vérifier l'auto-complétion des champs

**Résultats attendus :**
- ✅ SIRET validé via API INSEE
- ✅ Nom de l'entreprise auto-complété
- ✅ Adresse auto-complétée
- ✅ Région auto-complétée

**Critères de validation :**
- [ ] Appel API réussi
- [ ] Données correctement mappées
- [ ] Gestion des erreurs API
- [ ] Performance acceptable

---

### TEST-01-014 : API France Compétence - Synchronisation

**Objectif :** Valider l'intégration API France Compétence

**Prérequis :**
- Centre certificateur avec SIRET
- Token API France Compétence configuré

**Étapes :**
1. Se connecter en tant que centre certificateur
2. Aller dans "Mes certifications"
3. Cliquer sur "Synchroniser avec France Compétence"
4. Attendre la synchronisation
5. Vérifier les certifications importées

**Résultats attendus :**
- ✅ Appel API France Compétence réussi
- ✅ Certifications importées en base
- ✅ `france_competence_last_sync` mis à jour
- ✅ Interface mise à jour avec les certifications

**Critères de validation :**
- [ ] Synchronisation automatique fonctionnelle
- [ ] Données certifications complètes
- [ ] Gestion des erreurs API
- [ ] Mise à jour incrémentale

---

### TEST-01-015 : Sécurité - Injection SQL

**Objectif :** Vérifier la protection contre les injections SQL

**Cas de test :**
- Email : `admin@test.com'; DROP TABLE users; --`
- Mot de passe : `' OR '1'='1`
- SIRET : `123'; DELETE FROM training_centers; --`

**Étapes :**
1. Tenter de créer un compte avec email malveillant
2. Tenter de se connecter avec mot de passe malveillant
3. Tenter de créer un profil avec SIRET malveillant

**Résultats attendus :**
- ✅ Toutes les tentatives bloquées
- ✅ Données échappées correctement
- ✅ Base de données intacte
- ✅ Logs de sécurité générés

**Critères de validation :**
- [ ] Protection ORM effective
- [ ] Validation des entrées stricte
- [ ] Logs de tentatives malveillantes

---

### TEST-01-016 : Sécurité - XSS (Cross-Site Scripting)

**Objectif :** Vérifier la protection contre les attaques XSS

**Cas de test :**
- Nom : `<script>alert('XSS')</script>`
- Bio : `<img src="x" onerror="alert('XSS')">`

**Étapes :**
1. Créer un profil avec du code JavaScript malveillant
2. Afficher le profil dans l'interface
3. Vérifier que le code n'est pas exécuté

**Résultats attendus :**
- ✅ Code JavaScript échappé/neutralisé
- ✅ Pas d'exécution de script malveillant
- ✅ Affichage sécurisé des données

**Critères de validation :**
- [ ] Échappement HTML automatique
- [ ] Sanitisation des entrées utilisateur
- [ ] Protection côté client et serveur

---

### TEST-01-017 : Performance - Temps de Réponse

**Objectif :** Valider les performances des endpoints critiques

**Endpoints à tester :**
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/profile/center`
- PUT `/api/profile/center`

**Étapes :**
1. Mesurer le temps de réponse pour chaque endpoint
2. Tester avec charge normale (1 utilisateur)
3. Tester avec charge légère (10 utilisateurs simultanés)

**Résultats attendus :**
- ✅ Temps de réponse < 2 secondes
- ✅ Performance stable sous charge légère
- ✅ Pas de dégradation significative

**Critères de validation :**
- [ ] Temps de réponse conformes aux spécifications
- [ ] Stabilité sous charge
- [ ] Optimisation des requêtes base de données

---

### TEST-01-018 : Tests d'Emails Resend - Délivrabilité

**Objectif :** Valider la délivrabilité et le rendu des emails Resend

**Prérequis :**
- Compte Resend configuré avec domaine vérifié
- Plusieurs adresses email de test (Gmail, Outlook, Yahoo)

**Étapes :**
1. Tester l'inscription avec différents fournisseurs d'email
2. Vérifier la réception dans la boîte principale (pas spam)
3. Tester le rendu sur différents clients email
4. Vérifier les liens et boutons dans les emails
5. Tester la réactivité mobile des templates

**Résultats attendus :**
- ✅ **Emails reçus dans la boîte principale (pas spam)**
- ✅ **Rendu correct sur Gmail, Outlook, Apple Mail**
- ✅ **Templates responsive sur mobile**
- ✅ **Liens fonctionnels dans tous les clients**
- ✅ **Images et logos affichés correctement**
- ✅ **Temps de livraison < 30 secondes**

**Critères de validation :**
- [ ] **Score de délivrabilité > 95%**
- [ ] **Rendu identique sur tous les clients email**
- [ ] **Responsive design fonctionnel**
- [ ] **Tous les liens cliquables et fonctionnels**
- [ ] **Branding cohérent avec SimplyJury**
- [ ] **Texte alternatif pour les images**

---

### TEST-01-019 : Tests d'Emails - Gestion des Erreurs

**Objectif :** Valider la gestion des erreurs d'envoi d'emails

**Cas de test :**
- Email invalide : `invalid-email`
- Email inexistant : `nonexistent@fakdomain12345.com`
- Domaine bloqué : `test@10minutemail.com`

**Étapes :**
1. Tenter de créer un compte avec email invalide
2. Tenter de réinitialiser le mot de passe avec email inexistant
3. Vérifier les logs d'erreur Resend
4. Contrôler la gestion gracieuse des erreurs

**Résultats attendus :**
- ✅ **Validation côté client des formats d'email**
- ✅ **Gestion gracieuse des erreurs d'envoi**
- ✅ **Logs détaillés des échecs d'envoi**
- ✅ **Messages d'erreur utilisateur appropriés**
- ✅ **Retry automatique en cas d'erreur temporaire**

**Critères de validation :**
- [ ] **Validation robuste des adresses email**
- [ ] **Gestion des erreurs sans crash de l'app**
- [ ] **Logs structurés pour le debugging**
- [ ] **Messages d'erreur en français**
- [ ] **Mécanisme de retry intelligent**

---

### TEST-01-020 : Compatibilité Navigateurs

**Objectif :** Valider le fonctionnement sur différents navigateurs

**Navigateurs à tester :**
- Chrome (dernière version)
- Firefox (dernière version)
- Safari (dernière version)
- Edge (dernière version)

**Tests à effectuer sur chaque navigateur :**
1. Inscription utilisateur
2. Connexion utilisateur
3. Création de profil
4. Upload de photo (jury)

**Résultats attendus :**
- ✅ Fonctionnement identique sur tous les navigateurs
- ✅ Interface responsive correcte
- ✅ Pas d'erreurs JavaScript

**Critères de validation :**
- [ ] Compatibilité cross-browser
- [ ] Interface cohérente
- [ ] Fonctionnalités complètes

---

## 📊 Rapport de Tests

### Récapitulatif des Tests

| Test ID | Nom du Test | Statut | Commentaires |
|---------|-------------|--------|--------------|
| TEST-01-001 | Inscription Centre | ⏳ À tester | |
| TEST-01-002 | Inscription Jury | ⏳ À tester | |
| TEST-01-003 | Validation Mots de Passe | ⏳ À tester | |
| TEST-01-004 | Vérification Email | ⏳ À tester | |
| TEST-01-005 | Connexion Utilisateur | ⏳ À tester | |
| TEST-01-006 | Email Non Vérifié | ⏳ À tester | |
| TEST-01-007 | Réinitialisation MDP | ⏳ À tester | |
| TEST-01-008 | Profil Centre | ⏳ À tester | |
| TEST-01-009 | Centre Certificateur | ⏳ À tester | |
| TEST-01-010 | Profil Jury | ⏳ À tester | |
| TEST-01-011 | Validation Admin | ⏳ À tester | |
| TEST-01-012 | Refus Admin | ⏳ À tester | |
| TEST-01-013 | API SIRET | ⏳ À tester | |
| TEST-01-014 | API France Compétence | ⏳ À tester | |
| TEST-01-015 | Sécurité SQL | ⏳ À tester | |
| TEST-01-016 | Sécurité XSS | ⏳ À tester | |
| TEST-01-017 | Performance | ⏳ À tester | |
| TEST-01-018 | Emails Délivrabilité | ⏳ À tester | |
| TEST-01-019 | Emails Erreurs | ⏳ À tester | |
| TEST-01-020 | Compatibilité | ⏳ À tester | |

### Légende des Statuts
- ✅ **Réussi** : Test passé avec succès
- ❌ **Échec** : Test échoué, correction nécessaire
- ⚠️ **Partiel** : Test partiellement réussi, améliorations possibles
- ⏳ **À tester** : Test non encore effectué
- 🚫 **Bloqué** : Test bloqué par une dépendance

---

## 🔧 Environnement de Test

### Configuration Requise
- **Node.js** : v18+
- **pnpm** : dernière version
- **Base de données** : Supabase PostgreSQL
- **Service d'emails** : Resend configuré
- **Variables d'environnement** :
  ```env
  DATABASE_URL=postgresql://...
  AUTH_SECRET=test-secret-key
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
  INSEE_API_TOKEN=test-token
  FRANCE_COMPETENCE_API_TOKEN=test-token
  ```

### Données de Test
- **Email centre** : test-centre@example.com
- **Email jury** : test-jury@example.com
- **Email admin** : admin@simplyjury.com
- **Mot de passe standard** : TestPassword123!
- **SIRET test** : 12345678901234

### Configuration Resend
- **Domaine d'envoi** : noreply@simplyjury.com
- **Domaine de réponse** : support@simplyjury.com
- **Templates** : React Email components
- **Webhook** : Configuré pour les événements de livraison

### Commandes Utiles
```bash
# Démarrer l'application
pnpm dev

# Réinitialiser la base de données
pnpm db:reset

# Générer des données de test
pnpm db:seed

# Lancer les tests automatisés
pnpm test
```

---

## 📝 Notes de Test

### Points d'Attention
- Vérifier les logs de sécurité pour toute tentative malveillante
- Tester avec des données réelles pour les APIs externes
- Valider l'accessibilité WCAG AA
- Contrôler la conformité RGPD
- **Vérifier la délivrabilité des emails Resend**
- **Tester le rendu sur différents clients email**
- **Contrôler les métriques d'ouverture et de clic**
- **Valider la gestion des bounces et plaintes**

### Améliorations Suggérées
- Ajouter des tests automatisés E2E avec Playwright
- Implémenter des tests de charge avec k6
- Créer des snapshots visuels pour les tests de régression
- Mettre en place un monitoring des performances en production
- **Configurer les webhooks Resend pour le tracking des emails**
- **Implémenter des tests automatisés d'emails avec MailHog**
- **Ajouter des métriques de délivrabilité dans le dashboard admin**
- **Créer des A/B tests sur les templates d'emails**
