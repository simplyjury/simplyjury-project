# Analyse des Coûts et Inscription aux APIs - SimplyJury

## 📋 Résumé Exécutif

Ce document présente l'analyse détaillée des coûts et des modalités d'inscription pour les APIs nécessaires à l'implémentation des nouvelles fonctionnalités de profils utilisateurs dans SimplyJury.

**Date :** 27 août 2025  
**Version :** 1.0  
**Statut :** En attente d'approbation client  

---

## 🎯 APIs Identifiées

### 1. API Entreprise (Gouvernement Français)
**Objectif :** Détection automatique du statut de certification Qualiopi

### 2. API Pappers
**Objectif :** Auto-complétion des informations entreprise via SIRET/SIREN

---

## 💰 Analyse des Coûts

### API Entreprise - Qualiopi & Habilitations France Compétences

#### ✅ **GRATUIT**
- **Coût de développement :** 0€
- **Coût de production :** 0€
- **Service public :** API gouvernementale entièrement gratuite

#### **Modalités d'accès :**
- **Phase de test :** Environnement de staging gratuit avec jetons publics
- **Phase de production :** Demande d'habilitation obligatoire
- **URL de test :** `https://staging.entreprise.api.gouv.fr`
- **Processus :** Justification du cas d'usage administratif requis

#### **Données fournies :**
- Statut de certification Qualiopi en temps réel
- Types de qualification (Action formation, Bilan Compétences, VAE, Apprentissage)
- Habilitations France Compétences
- Numéros de déclaration d'activité (NDA)

---

### API Pappers - Auto-complétion SIRET

#### ⚠️ **FREEMIUM avec Limitations**
- **Version gratuite :** 100 requêtes/jour par adresse IP
- **Version payante :** Tarification sur demande (non publique)

#### **Modalités d'accès :**
- **Phase de test :** 100 requêtes gratuites/jour suffisantes pour le développement
- **Phase de production :** Abonnement payant requis
- **Contact commercial :** Nécessaire pour obtenir la grille tarifaire

#### **Données fournies :**
- Nom de l'entreprise
- Adresse complète
- Secteur d'activité
- Informations SIRET/SIREN validées

---

## 🔄 Alternative Gratuite : API Sirene INSEE

### **Option de Remplacement pour API Pappers**
- **Coût :** Entièrement gratuit
- **Fournisseur :** INSEE (service public)
- **Données :** Informations officielles du répertoire Sirene
- **Limitation :** Interface moins conviviale que Pappers

---

## 📊 Impact Budgétaire

### **Coûts Estimés**

| Phase | API Entreprise | API Pappers | Alternative INSEE |
|-------|----------------|-------------|-------------------|
| **Développement** | 0€ | 0€ | 0€ |
| **Production** | 0€ | À déterminer* | 0€ |

*Tarification Pappers non communiquée publiquement

### **Scénarios Budgétaires**

#### **Scénario 1 : Solution Entièrement Gratuite**
- API Entreprise (Qualiopi) : 0€
- API Sirene INSEE (SIRET) : 0€
- **Total : 0€**

#### **Scénario 2 : Solution Hybride**
- API Entreprise (Qualiopi) : 0€
- API Pappers (SIRET) : Budget à prévoir
- **Total : Coût API Pappers uniquement**

---

## 🛠️ Stratégie d'Implémentation Recommandée

### **Phase 1 : Développement (Immédiat)**
1. **API Entreprise :** Utilisation de l'environnement de test gratuit
2. **API Pappers :** Utilisation des 100 requêtes gratuites/jour
3. **Développement :** Implémentation complète des deux intégrations

### **Phase 2 : Préparation Production (Semaine 2-3)**
1. **API Entreprise :** Soumission de la demande d'habilitation
2. **API Pappers :** Contact commercial pour tarification
3. **Évaluation :** Comparaison Pappers vs INSEE Sirene

### **Phase 3 : Mise en Production (Semaine 4-5)**
1. **API Entreprise :** Activation du jeton de production (gratuit)
2. **SIRET :** Décision finale entre Pappers (payant) ou INSEE (gratuit)

---

## ✅ Recommandations

### **Recommandation Principale**
**Adopter le Scénario 1 (Solution entièrement gratuite)** pour le MVP :
- API Entreprise pour Qualiopi (gratuit)
- API Sirene INSEE pour SIRET (gratuit)
- Budget API : 0€

### **Avantages :**
- Aucun coût récurrent
- APIs gouvernementales fiables
- Données officielles et à jour
- Conformité réglementaire garantie

### **Inconvénients :**
- Interface API Sirene moins ergonomique que Pappers
- Développement légèrement plus complexe

### **Option d'Évolution**
Possibilité de migrer vers API Pappers ultérieurement si le budget le permet et si l'expérience utilisateur justifie l'investissement.

---

## 📋 Actions Requises

### **Approbation Client Nécessaire :**
1. **Validation de la stratégie** : Scénario 1 (gratuit) vs Scénario 2 (hybride)
2. **Autorisation** : Demande d'habilitation API Entreprise au nom du client
3. **Budget** : Allocation éventuelle pour API Pappers si Scénario 2 retenu

### **Prochaines Étapes :**
1. Approbation de ce document
2. Lancement de la demande d'habilitation API Entreprise
3. Début du développement avec les environnements de test

---

## 📞 Contact et Support

- **API Entreprise :** Support gouvernemental via entreprise.api.gouv.fr
- **API Pappers :** Support commercial via pappers.fr
- **API Sirene INSEE :** Documentation officielle INSEE

---

**Document préparé pour validation client**  
*Équipe technique SimplyJury*
