# 📊 Guide de Gestion des Abonnements - SimplyJury

**Version:** 1.0  
**Date:** 7 novembre 2025  
**Destinataire:** Équipe SimplyJury

---

## 🎯 Vue d'ensemble

Ce document décrit les deux interfaces d'administration permettant de gérer les abonnements et la liste d'attente des centres de formation sur la plateforme SimplyJury.

---

## 📋 Table des matières

1. [Page Gestion des Abonnements](#1-page-gestion-des-abonnements)
2. [Page Liste d'Attente](#2-page-liste-dattente)
3. [Guide de Tests - Système Freemium](#3-guide-de-tests---système-freemium)

---

## 1. Page Gestion des Abonnements

**URL :** `/dashboard/admin/subscriptions`

### 🎯 Objectif

Cette page permet de visualiser et gérer les abonnements de tous les centres de formation inscrits sur SimplyJury. Vous pouvez :
- Voir le plan actuel de chaque centre
- Consulter leur utilisation de contacts
- Accorder un accès Premium temporaire
- Définir des limites de contacts personnalisées
- Rembourser des contacts utilisés

---

### 📊 Statistiques en haut de page

Quatre cartes affichent les statistiques globales :

| Statistique | Description |
|-------------|-------------|
| **Total Centres** | Nombre total de centres inscrits sur la plateforme |
| **Plan Gratuit** | Nombre de centres utilisant le plan gratuit (1 contact/mois) |
| **Plan Basic** | Nombre de centres abonnés au plan Basic (5 contacts/mois) |
| **Plan Pro** | Nombre de centres abonnés au plan Pro (15 contacts/mois) |

---

### 🔍 Filtres et recherche

**Barre de recherche**
- Permet de rechercher un centre par son nom ou son email
- La recherche est instantanée (pas besoin d'appuyer sur Entrée)

**Filtre par plan**
- Menu déroulant "Tous les plans"
- Options : Gratuit, Basic, Pro
- Affiche uniquement les centres du plan sélectionné

**Bouton Actualiser**
- Icône de rafraîchissement
- Recharge les données depuis la base de données
- Utile après avoir effectué des modifications

---

### 📋 Tableau des centres

Le tableau principal affiche tous les centres avec les colonnes suivantes :

#### Colonne 1 : Centre
- **Nom du centre** (en gras)
- **Email du centre** (en gris, plus petit)

**Exemple :**
```
CNAM CONSERVATOIRE NATIONAL DES ARTS ET METIERS
cedric.kerbidi@gmail.com
```

---

#### Colonne 2 : Plan / Accès

Cette colonne affiche le **plan effectif** du centre, c'est-à-dire ce à quoi il a réellement accès en ce moment.

**Cas 1 : Centre avec accès normal**
- Badge coloré indiquant le plan (Gratuit/Basic/Pro)
- Icône correspondante (🎁 Gratuit, ⚡ Basic, 👑 Pro)

**Cas 2 : Centre avec accès Premium temporaire**
- Badge violet "👑 Premium (Accès temporaire)"
- Date d'expiration : "Expire : 06/10/2025"
- Plan de base en gris : "Plan de base : Gratuit"

**Pourquoi cette distinction ?**
Un administrateur peut accorder un accès Premium temporaire à un centre (par exemple pour tester la plateforme ou comme geste commercial). Dans ce cas :
- Le centre bénéficie de 15 contacts/mois (comme le plan Pro)
- L'accès est limité dans le temps
- Son plan de base reste inchangé (souvent Gratuit)
- À l'expiration, il revient automatiquement à son plan de base

---

#### Colonne 3 : Contacts

Affiche l'utilisation des contacts du centre pour la période en cours (30 jours).

**Format principal :** `X/Y`
- **X** = Nombre de contacts utilisés
- **Y** = Limite de contacts autorisée

**Codes couleur :**
- Noir : utilisation normale
- Rouge : limite atteinte (X = Y)

**Informations complémentaires :**

1. **Badge "Manuel"** (si présent)
   - Indique qu'une limite personnalisée a été définie
   - Exemple : "Manuel: 20"
   - Cette limite remplace temporairement la limite du plan

2. **Date de période** (si présente)
   - Exemple : "Période : 15/10/2025"
   - Indique le début de la période de 30 jours en cours
   - La période démarre au premier contact accepté

**Exemples :**
```
1/15                    → 1 contact utilisé sur 15 autorisés
13/15                   → 13 contacts utilisés sur 15 autorisés
15/15                   → Limite atteinte (en rouge)
5/20 [Manuel: 20]       → Limite personnalisée de 20 contacts
```

---

#### Colonne 4 : Actions

Trois boutons d'action sont disponibles pour chaque centre :

**1. Bouton "Premium" (violet)**
- **Fonction :** Accorder un accès Premium temporaire
- **Utilisation :** 
  - Cliquez sur le bouton
  - Une fenêtre s'ouvre
  - Sélectionnez la durée (1 mois, 3 mois, 6 mois, 1 an)
  - Confirmez
- **Résultat :** Le centre obtient 15 contacts/mois jusqu'à la date d'expiration
- **Cas d'usage :**
  - Période d'essai gratuite
  - Geste commercial
  - Compensation pour un problème technique

**2. Bouton "Limite"**
- **Fonction :** Définir une limite de contacts personnalisée
- **Utilisation :**
  - Cliquez sur le bouton
  - Une fenêtre s'ouvre
  - Entrez le nombre de contacts souhaité
  - Sélectionnez la durée (1 mois, 3 mois, 6 mois, permanent)
  - Confirmez
- **Résultat :** Le centre obtient la limite personnalisée définie
- **Cas d'usage :**
  - Offre spéciale pour un gros client
  - Ajustement temporaire pour un événement
  - Limite réduite en cas d'abus

**3. Bouton "Rembourser"**
- **Fonction :** Rembourser un contact utilisé
- **Utilisation :**
  - Cliquez sur le bouton
  - Une fenêtre s'ouvre avec la liste des demandes acceptées
  - Sélectionnez la demande à rembourser
  - Ajoutez une raison (optionnel)
  - Confirmez
- **Résultat :** Le compteur de contacts utilisés diminue de 1
- **Cas d'usage :**
  - Jury qui s'est désisté au dernier moment
  - Problème technique lors de la session
  - Erreur de manipulation du centre
  - Geste commercial

**Important :** Le remboursement ne supprime pas la demande, il recrédite simplement un contact au centre.

---

### 💡 Exemples de scénarios

**Scénario 1 : Accorder un essai Premium**
1. Un centre gratuit souhaite tester les fonctionnalités Pro
2. Cliquez sur "Premium" pour ce centre
3. Sélectionnez "1 mois"
4. Le centre a maintenant 15 contacts/mois pendant 1 mois
5. Après 1 mois, il revient automatiquement au plan Gratuit

**Scénario 2 : Remboursement suite à un problème**
1. Un centre signale qu'un jury ne s'est pas présenté
2. Cliquez sur "Rembourser" pour ce centre
3. Sélectionnez la demande concernée dans la liste
4. Ajoutez la raison : "Jury absent le jour de la session"
5. Le centre récupère 1 contact (ex: passe de 5/5 à 4/5)

**Scénario 3 : Limite personnalisée pour un événement**
1. Un centre organise un grand événement et a besoin de plus de contacts
2. Cliquez sur "Limite" pour ce centre
3. Entrez "25" contacts
4. Sélectionnez "1 mois"
5. Le centre a maintenant 25 contacts pour le mois en cours

---

## 2. Page Liste d'Attente

**URL :** `/dashboard/admin/waiting-list`

### 🎯 Objectif

Cette page permet de gérer les utilisateurs qui ont manifesté leur intérêt pour un abonnement payant (Basic ou Pro). C'est votre outil de suivi commercial pour convertir les prospects en clients payants.

---

### 📊 Statistiques en haut de page

Quatre cartes affichent les statistiques de la liste d'attente :

| Statistique | Description |
|-------------|-------------|
| **Total** | Nombre total d'inscriptions à la liste d'attente |
| **En attente** | Inscriptions non encore contactées (statut : pending) |
| **Contactés** | Inscriptions déjà contactées mais pas encore converties |
| **Convertis** | Inscriptions qui sont devenues des clients payants |

---

### 🔍 Filtres et recherche

**Barre de recherche**
- Recherche par email de l'utilisateur
- Recherche instantanée

**Filtre par statut**
- Menu déroulant "Tous les statuts"
- Options :
  - **En attente** : Nouveaux prospects à contacter
  - **Contacté** : Prospects déjà contactés
  - **Converti** : Prospects devenus clients
  - **Refusé** : Prospects qui ont décliné l'offre

**Filtre par plan**
- Menu déroulant "Tous les plans"
- Options : Basic, Pro
- Permet de prioriser les prospects Pro (plus de valeur)

**Bouton Actualiser**
- Recharge les données
- Utile pour voir les nouvelles inscriptions

---

### 📋 Tableau de la liste d'attente

Le tableau affiche toutes les inscriptions avec les colonnes suivantes :

#### Colonne 1 : Email
- Adresse email du prospect
- C'est l'identifiant principal pour le contacter

**Exemple :**
```
cedric.kerbidi+43@gmail.com
```

---

#### Colonne 2 : Plan

Badge coloré indiquant le plan souhaité par le prospect :

- **Badge bleu "BASIC"** : Le prospect souhaite 5 contacts/mois
- **Badge violet "PRO"** : Le prospect souhaite 15 contacts/mois

**Astuce :** Priorisez les prospects "PRO" car ils représentent un revenu plus élevé.

---

#### Colonne 3 : Statut

Badge indiquant l'état actuel du prospect :

| Badge | Signification | Action recommandée |
|-------|---------------|-------------------|
| 🕐 **En attente** (jaune) | Nouveau prospect, pas encore contacté | Contacter rapidement |
| ✉️ **Contacté** (bleu) | Prospect contacté, en discussion | Suivre la conversation |
| ✅ **Converti** (vert) | Prospect devenu client payant | Aucune action nécessaire |
| ❌ **Refusé** (rouge) | Prospect a décliné l'offre | Archivé |

---

#### Colonne 4 : Source

Indique comment le prospect a rejoint la liste d'attente :

| Source | Signification | Niveau d'urgence |
|--------|---------------|------------------|
| **limit_reached** | Le centre a atteint sa limite de contacts et est bloqué | 🔴 **URGENT** - Contacter immédiatement |
| **pricing_page** | Inscription depuis la page tarifs | 🟡 Normal |
| **dashboard_cta** | Inscription depuis le tableau de bord | 🟡 Normal |
| **manual** | Ajout manuel par un administrateur | 🟡 Normal |

**Important :** Les prospects "limit_reached" sont bloqués et ne peuvent plus utiliser la plateforme. Ils doivent être contactés en priorité.

---

#### Colonne 5 : Date

Date d'inscription à la liste d'attente au format français (JJ/MM/AAAA).

**Exemple :**
```
07/11/2025
```

**Astuce :** Triez par date pour identifier les prospects les plus anciens qui attendent une réponse.

---

#### Colonne 6 : Notes

Cette colonne affiche un indicateur visuel si des notes de contact existent :

- **Icône 📄 (bleue)** : Des notes existent
- **Tiret "-"** : Aucune note

**Comment consulter les notes :**
1. Passez la souris sur l'icône 📄
2. Une bulle d'information apparaît
3. Elle affiche :
   - Le texte complet de la note
   - La date et l'heure du contact

**Exemple de note :**
```
"Appelé le 07/11/2025 à 14h30. 
Intéressé par le plan Pro. 
Souhaite une démo avant de s'engager.
Rappeler la semaine prochaine."
```

**Utilité des notes :**
- Garder une trace des échanges avec le prospect
- Assurer la continuité si un autre administrateur prend le relais
- Planifier les prochaines actions

---

#### Colonne 7 : Actions

Cette colonne affiche des actions différentes selon le statut de l'entrée.

---

##### Pour les entrées "En attente"

**Bouton "Marquer contacté"**

**Fonction :** Indiquer que vous avez contacté le prospect

**Utilisation :**
1. Cliquez sur le bouton
2. Une fenêtre s'ouvre
3. Saisissez vos notes de contact dans le champ texte
4. Cliquez sur "Confirmer"

**Résultat :**
- Le statut passe de "En attente" à "Contacté"
- La date de contact est enregistrée
- Vos notes sont sauvegardées
- Une icône 📄 apparaît dans la colonne Notes
- Un menu d'actions (⋮) remplace le bouton

---

##### Pour les entrées "Contacté", "Converti" ou "Refusé"

**Menu d'actions (⋮)**

Un bouton avec trois points verticaux (⋮) ouvre un menu déroulant avec plusieurs options.

**Options disponibles pour "Contacté" :**

1. **✅ Marquer converti**
   - **Quand l'utiliser :** Le prospect a accepté l'offre et est devenu client
   - **Action :** Change le statut en "Converti" (badge vert)
   - **Résultat :** L'entrée compte dans les statistiques de conversion

2. **❌ Marquer refusé**
   - **Quand l'utiliser :** Le prospect a décliné l'offre
   - **Action :** Change le statut en "Refusé" (badge rouge)
   - **Résultat :** L'entrée est archivée comme opportunité perdue

3. **📝 Modifier notes**
   - **Quand l'utiliser :** Vous devez ajouter ou modifier les informations de contact
   - **Action :** Ouvre une fenêtre pour éditer les notes
   - **Résultat :** Les notes sont mises à jour

4. **🗑️ Supprimer**
   - **Quand l'utiliser :** L'entrée est un doublon, spam, ou n'est plus pertinente
   - **Action :** Supprime définitivement l'entrée après confirmation
   - **Résultat :** L'entrée disparaît de la liste

**Options disponibles pour "Converti" ou "Refusé" :**

1. **🔄 Remettre en attente**
   - **Quand l'utiliser :** Le statut a été changé par erreur
   - **Action :** Remet le statut à "En attente"
   - **Résultat :** L'entrée peut être retraitée

2. **📝 Modifier notes** (même fonction que ci-dessus)

3. **🗑️ Supprimer** (même fonction que ci-dessus)

---

##### Fenêtre "Modifier notes"

Lorsque vous cliquez sur "Modifier notes" :

**Contenu de la fenêtre :**
- Email du prospect (en lecture seule)
- Zone de texte pour éditer les notes
- Bouton "Enregistrer" (vert)
- Bouton "Annuler" (gris)

**Utilisation :**
1. Modifiez le texte dans la zone de notes
2. Cliquez sur "Enregistrer" pour sauvegarder
3. Ou cliquez sur "Annuler" pour fermer sans sauvegarder

**Que mettre dans les notes ?**
- Date et heure du contact
- Canal utilisé (téléphone, email, visio)
- Résumé de la conversation
- Niveau d'intérêt du prospect
- Prochaines actions à effectuer
- Date de rappel prévue
- Raison du refus (si applicable)
- Conditions de conversion (si applicable)

**Exemple de bonnes notes :**
```
Appelé le 07/11/2025 à 10h15.
Contact : Marie Dubois, directrice.
Très intéressée par le plan Pro.
Budget disponible en janvier 2026.
Souhaite une démo des fonctionnalités avancées.
Action : Programmer une démo pour le 15/11/2025.

Mise à jour 15/11/2025 :
Démo effectuée. Très satisfaite.
Signature du contrat prévue pour le 20/11/2025.
```

---

### 📧 Notifications automatiques

**Important :** Lorsqu'un utilisateur rejoint la liste d'attente, tous les administrateurs reçoivent automatiquement un email de notification.

**Contenu de l'email :**
- Email du prospect
- Nom du centre (si disponible)
- Plan souhaité (Basic ou Pro)
- Contexte (comment il a rejoint)
- Nombre de contacts utilisés (si applicable)
- Bouton "Voir la liste d'attente" pour accéder directement à la page

**Types d'emails :**

1. **Email urgent** (limite atteinte)
   - Objet : "🚨 Urgent - Utilisateur bloqué intéressé par [plan]"
   - Message d'alerte : Le centre est bloqué et ne peut plus utiliser la plateforme
   - Action recommandée : Contacter immédiatement

2. **Email normal**
   - Objet : "🎯 Nouvelle inscription liste d'attente - [plan]"
   - Message d'opportunité : Un utilisateur est intéressé par un plan payant
   - Action recommandée : Contacter dans les 24-48h

---

### 💡 Exemples de scénarios

**Scénario 1 : Prospect urgent (limite atteinte)**
1. Vous recevez un email "🚨 Urgent - Utilisateur bloqué"
2. Vous ouvrez la liste d'attente
3. Le prospect est marqué "limit_reached" (source)
4. Vous cliquez sur "Marquer contacté"
5. Vous appelez le prospect immédiatement
6. Vous notez : "Appelé à 11h. Accepte le plan Pro. Envoi devis."
7. Vous activez son abonnement Pro depuis `/dashboard/admin/subscriptions`
8. Vous revenez sur la liste d'attente
9. Vous cliquez sur le menu (⋮) pour ce prospect
10. Vous cliquez sur "Marquer converti"
11. Le statut passe à "Converti" (badge vert)

**Scénario 2 : Prospect normal (page tarifs)**
1. Un prospect s'inscrit depuis la page tarifs
2. Vous recevez l'email de notification
3. Vous consultez la liste d'attente le lendemain
4. Vous cliquez sur "Marquer contacté"
5. Vous envoyez un email personnalisé
6. Vous notez : "Email envoyé le 07/11. Attente réponse."
7. Vous suivez dans quelques jours

**Scénario 3 : Conversion réussie**
1. Un prospect "Contacté" accepte l'offre Pro
2. Vous activez son abonnement depuis `/dashboard/admin/subscriptions`
3. Vous revenez sur la liste d'attente
4. Vous cliquez sur le menu (⋮) pour ce prospect
5. Vous cliquez sur "Marquer converti"
6. Le statut change en "Converti" (badge vert)
7. Le prospect compte dans les statistiques de conversion

**Scénario 4 : Prospect qui refuse**
1. Un prospect "Contacté" décline l'offre
2. Vous ouvrez la liste d'attente
3. Vous cliquez sur le menu (⋮) pour ce prospect
4. Vous cliquez sur "Marquer refusé"
5. Une fenêtre de confirmation apparaît
6. Vous confirmez
7. Le statut change en "Refusé" (badge rouge)
8. Vous pouvez cliquer sur "Modifier notes" pour ajouter la raison du refus

**Scénario 5 : Correction d'erreur**
1. Vous avez marqué un prospect "Converti" par erreur
2. Vous ouvrez la liste d'attente
3. Vous filtrez par statut "Converti"
4. Vous trouvez l'entrée erronée
5. Vous cliquez sur le menu (⋮)
6. Vous cliquez sur "Remettre en attente"
7. Le statut revient à "En attente" (badge jaune)
8. Vous pouvez retraiter l'entrée correctement

**Scénario 6 : Mise à jour des notes**
1. Vous avez contacté un prospect il y a une semaine
2. Le prospect vous rappelle avec des questions
3. Vous ouvrez la liste d'attente
4. Vous trouvez l'entrée (statut "Contacté")
5. Vous cliquez sur le menu (⋮)
6. Vous cliquez sur "Modifier notes"
7. Vous ajoutez : "Rappel le 14/11. Questions sur la facturation. Envoi documentation."
8. Vous cliquez sur "Enregistrer"
9. Les notes sont mises à jour et visibles dans la colonne Notes

**Scénario 7 : Suppression d'un doublon**
1. Vous remarquez deux entrées avec le même email
2. Vous vérifiez que c'est un doublon
3. Vous cliquez sur le menu (⋮) de l'entrée la plus récente
4. Vous cliquez sur "Supprimer"
5. Une confirmation apparaît : "Êtes-vous sûr de vouloir supprimer cette entrée ?"
6. Vous confirmez
7. L'entrée est supprimée définitivement
8. La liste se rafraîchit sans cette entrée

---

## 3. Guide de Tests - Système Freemium

Cette section décrit tous les cas de test à effectuer pour valider le bon fonctionnement du système d'abonnements et de limites de contacts.

---

### 📋 Préparation des tests

**Comptes de test nécessaires :**
- 1 compte centre avec plan Gratuit
- 1 compte centre avec plan Basic
- 1 compte centre avec plan Pro
- 1 compte administrateur
- 2-3 comptes jury pour accepter les demandes

**Données à noter pendant les tests :**
- Email du centre testé
- Plan actuel
- Nombre de contacts utilisés avant le test
- Limite de contacts
- Date de début de période

---

### Test 1 : Utilisation normale - Plan Gratuit

**Objectif :** Vérifier qu'un centre gratuit est limité à 1 contact par période de 30 jours

**Étapes :**
1. Connectez-vous avec un compte centre plan Gratuit
2. Allez sur le tableau de bord → Vérifiez le widget d'abonnement
   - ✅ Doit afficher "Plan Gratuit"
   - ✅ Doit afficher "0/1" contacts utilisés
3. Allez sur "Rechercher un jury"
4. Trouvez un jury et cliquez sur "Contacter ce jury"
5. Remplissez le formulaire et envoyez la demande
   - ✅ La demande doit être créée avec succès
6. Retournez au tableau de bord
   - ✅ Le widget doit maintenant afficher "1/1" contacts utilisés
   - ✅ La barre de progression doit être pleine (100%)
7. Retournez sur "Rechercher un jury"
8. Essayez de contacter un autre jury
   - ✅ Une fenêtre modale doit apparaître : "Limite de contacts atteinte"
   - ✅ Le bouton "Contacter ce jury" doit être désactivé
9. Dans la modale, cliquez sur "Rejoindre la liste d'attente"
   - ✅ Un formulaire doit s'afficher
   - ✅ Sélectionnez un plan (Basic ou Pro)
   - ✅ Soumettez le formulaire
   - ✅ Un message de confirmation doit apparaître

**Résultat attendu :** Le centre est bloqué après 1 contact et peut rejoindre la liste d'attente

---

### Test 2 : Utilisation normale - Plan Basic

**Objectif :** Vérifier qu'un centre Basic peut contacter 5 jurys

**Étapes :**
1. Connectez-vous avec un compte centre plan Basic
2. Vérifiez le widget : "0/5" contacts
3. Contactez 5 jurys différents (répétez 5 fois)
4. Après chaque demande acceptée par un jury :
   - ✅ Le compteur doit augmenter : 1/5, 2/5, 3/5, 4/5, 5/5
5. Après le 5ème contact :
   - ✅ Le widget doit afficher "5/5" (rouge)
   - ✅ Essayez de contacter un 6ème jury → Bloqué
   - ✅ La modale "Limite atteinte" doit apparaître

**Résultat attendu :** Le centre peut contacter exactement 5 jurys, puis est bloqué

---

### Test 3 : Utilisation normale - Plan Pro

**Objectif :** Vérifier qu'un centre Pro peut contacter 15 jurys

**Étapes :**
1. Connectez-vous avec un compte centre plan Pro
2. Vérifiez le widget : "0/15" contacts
3. Contactez 15 jurys différents
4. Vérifiez que le compteur augmente correctement
5. Après le 15ème contact :
   - ✅ Le widget doit afficher "15/15" (rouge)
   - ✅ Tentative de 16ème contact → Bloqué

**Résultat attendu :** Le centre peut contacter exactement 15 jurys

---

### Test 4 : Réinitialisation de période (30 jours)

**Objectif :** Vérifier que le compteur se réinitialise après 30 jours

**Étapes :**
1. Utilisez un centre qui a atteint sa limite (ex: Gratuit avec 1/1)
2. Notez la date de début de période affichée dans le widget
3. **Option A - Test manuel (attendre 30 jours) :**
   - Attendez 30 jours réels
   - Reconnectez-vous
   - ✅ Le compteur doit être à 0/1
   - ✅ Une nouvelle période doit avoir commencé
4. **Option B - Test avec modification base de données (admin) :**
   - Demandez à un admin de modifier `first_accepted_contact_date` à il y a 31 jours
   - Reconnectez-vous ou rafraîchissez la page
   - ✅ Le compteur doit se réinitialiser à 0/1
5. Essayez de contacter un nouveau jury
   - ✅ La demande doit être acceptée
   - ✅ Le compteur passe à 1/1

**Résultat attendu :** Le compteur se réinitialise automatiquement après 30 jours

---

### Test 5 : Liste d'attente - Inscription

**Objectif :** Vérifier qu'un utilisateur peut rejoindre la liste d'attente

**Étapes :**
1. **Méthode 1 - Depuis la limite atteinte :**
   - Connectez-vous avec un centre à la limite
   - Essayez de contacter un jury
   - Dans la modale, cliquez sur "Rejoindre la liste d'attente"
   - Sélectionnez "Plan Pro"
   - Soumettez
   - ✅ Message de confirmation doit apparaître

2. **Méthode 2 - Depuis la page tarifs :**
   - Allez sur `/pricing`
   - Cliquez sur "Rejoindre la liste d'attente" sous un plan
   - Remplissez le formulaire
   - Soumettez
   - ✅ Message de confirmation doit apparaître

3. **Test doublon :**
   - Essayez de rejoindre à nouveau avec le même email
   - ✅ Message : "Vous êtes déjà sur la liste d'attente"

**Résultat attendu :** L'inscription fonctionne et les doublons sont détectés

---

### Test 6 : Admin - Accorder accès Premium temporaire

**Objectif :** Vérifier qu'un admin peut accorder un accès Premium

**Étapes :**
1. Connectez-vous en tant qu'administrateur
2. Allez sur `/dashboard/admin/subscriptions`
3. Trouvez un centre avec plan Gratuit (1/1 contacts utilisés)
4. Cliquez sur le bouton "Premium" (violet)
5. Dans la modale :
   - Sélectionnez "1 mois"
   - Ajoutez une raison : "Test accès Premium"
   - Cliquez sur "Confirmer"
   - ✅ Message de succès doit apparaître
6. Vérifiez dans le tableau :
   - ✅ La colonne "Plan / Accès" doit afficher "Premium (Accès temporaire)"
   - ✅ La date d'expiration doit être affichée
   - ✅ Le plan de base doit être indiqué en gris
7. Vérifiez la colonne "Contacts" :
   - ✅ Doit afficher "1/15" (limite Premium)
8. Connectez-vous avec le compte du centre
9. Vérifiez le widget :
   - ✅ Doit afficher "Plan Premium (Temporaire)"
   - ✅ Doit afficher "1/15" contacts
10. Essayez de contacter un nouveau jury
    - ✅ La demande doit être acceptée
    - ✅ Le compteur passe à 2/15

**Résultat attendu :** Le centre obtient 15 contacts temporairement

---

### Test 7 : Admin - Définir limite manuelle

**Objectif :** Vérifier qu'un admin peut définir une limite personnalisée

**Étapes :**
1. En tant qu'admin, allez sur `/dashboard/admin/subscriptions`
2. Trouvez un centre avec plan Gratuit (limite normale : 1)
3. Cliquez sur le bouton "Limite"
4. Dans la modale :
   - Entrez "10" comme nouvelle limite
   - Sélectionnez "1 mois" comme durée
   - Ajoutez une raison : "Test limite personnalisée"
   - Cliquez sur "Confirmer"
   - ✅ Message de succès doit apparaître
5. Vérifiez dans le tableau :
   - ✅ La colonne "Contacts" doit afficher "X/10"
   - ✅ Un badge "Manuel: 10" doit être visible
6. Connectez-vous avec le compte du centre
7. Vérifiez le widget :
   - ✅ Doit afficher "X/10" contacts
8. Contactez des jurys jusqu'à atteindre 10
   - ✅ Le 11ème contact doit être bloqué

**Résultat attendu :** La limite personnalisée remplace la limite du plan

---

### Test 8 : Admin - Rembourser un contact

**Objectif :** Vérifier qu'un admin peut rembourser un contact utilisé

**Étapes :**
1. Utilisez un centre qui a utilisé au moins 1 contact (ex: 1/1 pour Gratuit)
2. En tant qu'admin, allez sur `/dashboard/admin/subscriptions`
3. Trouvez ce centre
4. Cliquez sur le bouton "Rembourser"
5. Dans la modale :
   - ✅ Une liste de demandes acceptées doit s'afficher
   - Sélectionnez une demande dans le menu déroulant
   - Ajoutez une raison : "Jury absent le jour J"
   - Cliquez sur "Confirmer"
   - ✅ Message de succès doit apparaître
6. Vérifiez dans le tableau :
   - ✅ Le compteur doit avoir diminué de 1 (ex: 0/1 au lieu de 1/1)
7. Connectez-vous avec le compte du centre
8. Vérifiez le widget :
   - ✅ Le compteur doit refléter le remboursement
9. Essayez de contacter un nouveau jury
   - ✅ La demande doit être acceptée (le crédit a été restitué)

**Résultat attendu :** Le contact est remboursé et le centre peut à nouveau contacter

---

### Test 9 : Admin - Gestion liste d'attente

**Objectif :** Vérifier la gestion complète d'une entrée de liste d'attente

**Étapes :**
1. Assurez-vous qu'il y a au moins une entrée "En attente" dans la liste
2. En tant qu'admin, allez sur `/dashboard/admin/waiting-list`
3. **Test : Marquer comme contacté**
   - Trouvez une entrée avec statut "En attente"
   - Cliquez sur "Marquer contacté"
   - Ajoutez des notes : "Appelé le 07/11. Intéressé par Pro."
   - Cliquez sur "Confirmer"
   - ✅ Le statut doit passer à "Contacté" (badge bleu)
   - ✅ Une icône 📄 doit apparaître dans la colonne Notes

4. **Test : Consulter les notes**
   - Passez la souris sur l'icône 📄
   - ✅ Une bulle doit afficher vos notes

5. **Test : Modifier les notes**
   - Cliquez sur le menu (⋮) pour cette entrée
   - Cliquez sur "Modifier notes"
   - Ajoutez du texte : "Rappel prévu le 15/11"
   - Cliquez sur "Enregistrer"
   - ✅ Les notes doivent être mises à jour
   - Vérifiez en survolant l'icône 📄

6. **Test : Marquer comme converti**
   - Cliquez sur le menu (⋮)
   - Cliquez sur "Marquer converti"
   - ✅ Le statut doit passer à "Converti" (badge vert)
   - ✅ Le compteur "Convertis" en haut doit augmenter de 1

7. **Test : Remettre en attente**
   - Cliquez sur le menu (⋮)
   - Cliquez sur "Remettre en attente"
   - ✅ Le statut doit revenir à "En attente" (badge jaune)

8. **Test : Marquer comme refusé**
   - Marquez d'abord comme "Contacté"
   - Cliquez sur le menu (⋮)
   - Cliquez sur "Marquer refusé"
   - ✅ Le statut doit passer à "Refusé" (badge rouge)

9. **Test : Supprimer une entrée**
   - Cliquez sur le menu (⋮)
   - Cliquez sur "Supprimer"
   - ✅ Une confirmation doit apparaître
   - Confirmez
   - ✅ L'entrée doit disparaître de la liste

**Résultat attendu :** Toutes les actions de gestion fonctionnent correctement

---

### Test 10 : Admin - Filtres et recherche

**Objectif :** Vérifier que les filtres fonctionnent correctement

**Étapes sur `/dashboard/admin/subscriptions` :**
1. Utilisez la barre de recherche
   - Tapez un nom de centre
   - ✅ Seuls les centres correspondants doivent s'afficher
2. Utilisez le filtre "Plan"
   - Sélectionnez "Gratuit"
   - ✅ Seuls les centres gratuits doivent s'afficher
3. Combinez recherche + filtre
   - ✅ Les deux filtres doivent s'appliquer ensemble

**Étapes sur `/dashboard/admin/waiting-list` :**
1. Utilisez la barre de recherche
   - Tapez un email
   - ✅ Seules les entrées correspondantes doivent s'afficher
2. Utilisez le filtre "Statut"
   - Sélectionnez "Contacté"
   - ✅ Seules les entrées contactées doivent s'afficher
3. Utilisez le filtre "Plan"
   - Sélectionnez "Pro"
   - ✅ Seules les demandes Pro doivent s'afficher
4. Combinez les 3 filtres
   - ✅ Tous les filtres doivent s'appliquer ensemble

**Résultat attendu :** Les filtres fonctionnent individuellement et en combinaison

---

### Test 11 : Notifications email

**Objectif :** Vérifier que les emails de notification sont envoyés

**Étapes :**
1. Rejoignez la liste d'attente avec un nouveau compte
2. Vérifiez la boîte email de tous les administrateurs
   - ✅ Tous les admins doivent recevoir un email
   - ✅ L'email doit contenir :
     - Email du prospect
     - Plan souhaité
     - Contexte (source)
     - Bouton "Voir la liste d'attente"
3. Cliquez sur le bouton dans l'email
   - ✅ Doit rediriger vers `/dashboard/admin/waiting-list`

**Résultat attendu :** Les notifications email fonctionnent correctement

---

### Test 12 : Cas limites et erreurs

**Objectif :** Vérifier la gestion des cas d'erreur

**Test 12.1 - Demande en attente quand limite atteinte :**
1. Centre Gratuit avec 0/1 contacts
2. Envoyez une demande à un jury (statut : pending)
3. Envoyez une 2ème demande à un autre jury (statut : pending)
4. Le premier jury accepte
   - ✅ Compteur passe à 1/1
5. Le deuxième jury essaie d'accepter
   - ✅ Doit être bloqué ou afficher un message d'erreur

**Test 12.2 - Acceptation après expiration de période :**
1. Centre avec demande pending depuis 35 jours
2. La période a expiré et s'est réinitialisée
3. Le jury accepte la vieille demande
   - ✅ Doit compter dans la nouvelle période
   - ✅ Compteur doit augmenter correctement

**Test 12.3 - Accès Premium expiré :**
1. Centre avec accès Premium expiré
2. Connectez-vous avec ce centre
3. Vérifiez le widget
   - ✅ Doit afficher le plan de base (Gratuit)
   - ✅ La limite doit être celle du plan de base (1)

**Résultat attendu :** Les cas limites sont gérés correctement

---

### 📊 Tableau récapitulatif des tests

| # | Test | Priorité | Durée estimée | Statut |
|---|------|----------|---------------|--------|
| 1 | Plan Gratuit - Limite 1 contact | 🔴 Haute | 5 min | ⬜ |
| 2 | Plan Basic - Limite 5 contacts | 🔴 Haute | 10 min | ⬜ |
| 3 | Plan Pro - Limite 15 contacts | 🟡 Moyenne | 15 min | ⬜ |
| 4 | Réinitialisation période 30 jours | 🔴 Haute | 5 min | ⬜ |
| 5 | Liste d'attente - Inscription | 🔴 Haute | 5 min | ⬜ |
| 6 | Admin - Accès Premium temporaire | 🔴 Haute | 5 min | ⬜ |
| 7 | Admin - Limite manuelle | 🟡 Moyenne | 5 min | ⬜ |
| 8 | Admin - Remboursement contact | 🔴 Haute | 5 min | ⬜ |
| 9 | Admin - Gestion liste d'attente | 🔴 Haute | 10 min | ⬜ |
| 10 | Filtres et recherche | 🟡 Moyenne | 5 min | ⬜ |
| 11 | Notifications email | 🔴 Haute | 3 min | ⬜ |
| 12 | Cas limites et erreurs | 🟡 Moyenne | 10 min | ⬜ |

**Temps total estimé :** ~80 minutes

---

### ✅ Critères de validation

Le système freemium est considéré comme validé si :

1. ✅ **Limites de contacts respectées** - Chaque plan respecte sa limite
2. ✅ **Blocage fonctionnel** - Les centres ne peuvent pas dépasser leur limite
3. ✅ **Réinitialisation automatique** - Le compteur se remet à 0 après 30 jours
4. ✅ **Liste d'attente opérationnelle** - Les inscriptions fonctionnent
5. ✅ **Actions admin fonctionnelles** - Premium, limites, remboursements
6. ✅ **Gestion statuts liste d'attente** - Tous les changements de statut fonctionnent
7. ✅ **Notifications email** - Les admins reçoivent les alertes
8. ✅ **Interface utilisateur** - Tous les widgets et modales s'affichent correctement
9. ✅ **Pas de bugs critiques** - Aucune erreur bloquante
10. ✅ **Performance acceptable** - Temps de réponse < 2 secondes

---

### 🐛 Rapport de bugs

Si vous rencontrez un problème pendant les tests, notez :

**Informations à fournir :**
- Numéro du test concerné
- Étape exacte où le problème survient
- Comportement attendu vs comportement observé
- Capture d'écran si possible
- Message d'erreur (console navigateur ou serveur)
- Email du compte utilisé pour le test

**Exemple de rapport :**
```
Test #6 - Étape 5
Problème : Le compteur n'affiche pas 1/15 après l'accès Premium
Attendu : 1/15
Observé : 1/1
Compte : test-centre@example.com
Console : Aucune erreur
```

---

## 📞 Support et questions

Pour toute question sur l'utilisation de ces interfaces, contactez l'équipe technique de SimplyJury.

**Données importantes à connaître :**

### Plans et limites
- **Gratuit :** 1 contact / 30 jours
- **Basic :** 5 contacts / 30 jours (39€/mois)
- **Pro :** 15 contacts / 30 jours (89€/mois)
- **Premium temporaire :** 15 contacts / 30 jours (gratuit, durée limitée)

### Période de facturation
- La période de 30 jours commence au **premier contact accepté**
- Elle se réinitialise automatiquement tous les 30 jours
- Le compteur de contacts revient à 0 à chaque nouvelle période

### Remboursements
- Un remboursement recrédite 1 contact au centre
- Il ne supprime pas la demande de la base de données
- Il doit être justifié (problème technique, jury absent, etc.)

---

**Document créé le :** 7 novembre 2025  
**Dernière mise à jour :** 7 novembre 2025  
**Version :** 1.0
