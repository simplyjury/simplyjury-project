# **CENTRE DE FORMATION / ÉCOLE**

### 🎯 Objectif principal :

Trouver des jurys compétents et gérer ses mises en relation.

---

### 🔄 Parcours :

1. **Création de compte**
    - Écran : Formulaire d’inscription
    - Choix du rôle : ✅ Centre de formation
    - Données obligatoires :
        - Nom établissement / SIRET / connexion API pour juste tapé le siret et que les infos se remplissent automatiquement
        - info général Email, téléphone + info de la personne en charge de la recherche
        - **Checkbox "Centre certificateur" pour préciser le statut**
        - **Si certificateur : accès à l'API France Compétence pour rattacher les certifications**
2. **Tableau de bord**
    - Écran : Dashboard centre
    - Sections visibles :
        - "Rechercher un jury"
        - "Historique des demandes"
        - **"Gestion de la messagerie interne" (interface dédiée)**
        - **"Liste des jurys contactés" (vue complète avec statuts)**
        - **"Mes certifications" (pour centres certificateurs uniquement)**
        - Suggestions suite aux précédentes recherche.
3. **Recherche d’un jury**
    - Écran : Moteur de recherche
    - Filtres :
        - Certification visée ou domaine
        - Région
        - Dispo
        - Modalité visio/présentiel
    - Résultats sous forme de cartes avec mini-profil
4. **Demande de mise en relation**
    - Écran : Formulaire de mission
    - **Deux types de demandes possibles :**
        - **Demande de contact simple (messagerie interne texte uniquement)**
        - **Demande structurée de mission de jury**
    - **Infos pour demande structurée :**
        - Certification concernée ou domaine
        - Date de session
        - Nombre de participants
        - Modalité visio/présentiel
        - Repas / transport pris en charge (oui/non)
        - Message libre
    - **Possibilité de transformer une demande de contact en demande structurée**
    - Limite : 1 seul contact possible (version gratuite)
5. **Messagerie & Suivi**
    - **Écran : Interface de messagerie intégrée au dashboard**
    - **Gestion des conversations avec les jurys (texte uniquement)**
    - **Liste des jurys contactés avec historique des interactions**
    - Statut : en attente / accepté / refusé
    - **Conversion possible : contact → demande structurée**
    - Historique des missions (réalisées ou annulées)
    - **Filtres avancés : statut, date, domaine de certification**
    - **Export possible de la liste des contacts jurys**

---

6. **Gestion des certifications (centres certificateurs uniquement)**
    - **Écran : Liste des certifications rattachées**
    - **Synchronisation automatique avec l'API France Compétence**
    - **Détail de chaque certification avec statut et validité**
    - **Association possible jurys ↔ certifications spécifiques**
    - **Notifications automatiques des mises à jour de certifications**

---

### ⚠️ Points de vigilance :

- Bien expliquer les filtres pour éviter les erreurs
- Alerte claire si profil déjà contacté (freemium limité)
- Afficher le statut de la demande clairement
- **Distinguer clairement les centres certificateurs des centres classiques**
- **Interface de messagerie intuitive avec indicateurs visuels (lu/non lu)**
- **Workflow clair pour la transformation contact → demande structurée**