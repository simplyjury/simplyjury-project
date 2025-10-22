# Règles Métier - Système d'Abonnements SimplyJury

## 📊 Grille Tarifaire Proposée

| Plan | Prix | Contacts/mois | Caractéristiques |
|------|------|---------------|------------------|
| **Gratuit** | 0€ | 1 contact | Découverte de la plateforme |
| **Basic** | 39€ | 5 contacts | Messagerie complète, tableau de bord |
| **Pro** | 89€ | 15 contacts | Gestion certifications, exports, support prioritaire |

---

## 🎯 Règles de Comptage des Contacts

### Principe : Comptage à l'acceptation uniquement
**Un contact est comptabilisé uniquement lorsqu'un jury accepte une demande.**

**Justification :**
- ✅ Équitable : les centres ne paient que pour les mises en relation réussies
- ✅ Encourage l'utilisation : pas de crainte de "gaspiller" un contact
- ✅ Aligné avec la proposition de valeur : "1 mise en relation gratuite" = connexion confirmée
- ✅ Anti-fraude : évite la création de multiples comptes pour multiplier les tentatives

**Exemple :** Un centre envoie 3 demandes. Si seulement 1 jury accepte, le compteur = 1.

---

## 📅 Période de Renouvellement

### Fenêtre glissante de 30 jours
**Les contacts se renouvellent 30 jours après le premier contact accepté.**

**Justification :**
- ✅ Plus flexible qu'un mois calendaire (pas de jours "perdus" en milieu de mois)
- ✅ Simple à comprendre : "1 contact gratuit tous les 30 jours"
- ✅ Meilleur suivi de conversion (moment précis où l'utilisateur atteint sa limite)
- ✅ Compatible avec futurs cycles de facturation variables

**Exemple :** Premier contact accepté le 15 janvier → renouvellement le 14 février.

---

## 📝 Liste d'Attente (Phase MVP)

### Données collectées : Email + Plan souhaité uniquement

**Justification :**
- ✅ Minimise les frictions (taux de conversion maximal)
- ✅ Informations essentielles pour segmentation et suivi
- ✅ Données complémentaires collectables ultérieurement par email
- ✅ Focus MVP : capturer l'intérêt, pas qualifier exhaustivement

---

## 🚀 Parcours Utilisateur - Limite Atteinte

### Redirection vers liste d'attente (pas de paiement direct)

**Justification :**
- ✅ Intégration Stripe non incluse dans le MVP
- ✅ Capture des leads au moment d'intention maximale (limite atteinte)
- ✅ Transparence tarifaire sans fausses promesses
- ✅ Permet de mesurer la demande réelle avant développement complet

**Parcours :**
1. Limite atteinte → Modal avec grille tarifaire
2. CTA principal : "Rejoindre la liste d'attente"
3. Confirmation : "Nous vous contacterons au lancement des abonnements"

---

## 🔧 Capacités Administrateur

### Gestion flexible pour support client et partenariats

**Fonctionnalités :**
- ✅ Ajustement manuel des limites de contacts (support client, cas particuliers)
- ✅ Accès premium temporaire (essais gratuits, partenariats, tests)
- ✅ Remboursement manuel de contacts utilisés (erreurs système, litiges)
- ✅ Consultation et gestion de la liste d'attente (suivi commercial)

**Justification :**
- Flexibilité opérationnelle essentielle avant automatisation complète
- Support client de qualité pendant phase MVP
- Capacité à tester et ajuster l'offre
- Gestion des cas exceptionnels sans développement supplémentaire

**Note :** Les remboursements financiers seront gérés via le portail Stripe lors de l'intégration post-MVP.

---

## 🚀 Évolution Post-MVP : Intégration Stripe

### Phase 2 - Activation des Paiements (Développement Additionnel)

**Défis Techniques à Adresser :**

1. **Synchronisation État Abonnement**
   - Webhooks Stripe → Base de données SimplyJury
   - Gestion des états : actif, suspendu, annulé, impayé
   - Réconciliation en cas de désynchronisation

2. **Gestion du Cycle de Vie**
   - Création automatique de clients Stripe
   - Souscription/upgrade/downgrade avec proration
   - Renouvellement automatique et échecs de paiement
   - Annulation et période de grâce

3. **Sécurité et Conformité**
   - Intégration PCI-DSS compliant (Stripe Elements)
   - Gestion sécurisée des webhooks (signatures)
   - Protection contre la fraude et abus
   - Conformité RGPD pour données de paiement

4. **Expérience Utilisateur**
   - Tunnel de paiement optimisé
   - Portail client Stripe (gestion abonnement, factures)
   - Notifications email automatiques (confirmation, échec, renouvellement)
   - Interface de changement de plan avec aperçu proration

5. **Migration Liste d'Attente**
   - Conversion automatique des prospects en clients
   - Offres de lancement spéciales
   - Suivi de conversion et analytics

6. **Facturation et Comptabilité**
   - Génération automatique de factures conformes
   - Exports comptables
   - Gestion TVA multi-pays (si expansion)

**Complexité Estimée :** Ces développements représentent environ 40-50h additionnelles d'intégration technique, tests, et mise en production sécurisée.

---

## ✅ Validation Requise

Merci de valider ces règles métier avant implémentation de la phase MVP.
