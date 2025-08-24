# **ADMIN**

### 🎯 Objectif principal :

Gérer les inscriptions, valider les profils, suivre les statistiques et assurer le bon fonctionnement de la plateforme.

---

### 🔄 Parcours :

1. **Connexion à l’espace admin**
    - Écran : Login sécurisé
    - Action : email + mot de passe
    - ✅ Accès au back-office
2. **Tableau de bord d’accueil**
    - Écran : Dashboard admin
    - Infos visibles :
        - Nombre total de jurys inscrits
        - Nombre total de centres inscrits
        - Nombre de mises en relation
        - Derniers profils à valider
3. **Validation manuelle des profils**
    - **Écran : Liste des profils en attente (jurys ET centres certificateurs)**
    - Actions pour les jurys :
        - Voir les infos détaillées d'un jury (certifs, dispo, région…)
        - Bouton : ✅ Valider / ❌ Refuser
    - **Actions pour les centres certificateurs :**
        - **Vérifier le statut "certificateur" déclaré**
        - **Contrôler la cohérence avec les certifications rattachées via France Compétence**
        - **Valider l'accès aux fonctionnalités de certification**
    - ✅ Après validation, le profil est actif sur la plateforme et reçoit une notification de validation/refus avec les raisons.
4. **Gestion des utilisateurs**
    - Écran : Liste complète des utilisateurs (filtrable par rôle)
    - **Filtres supplémentaires : centres classiques / centres certificateurs**
    - Actions possibles :
        - Suspendre un compte
        - Supprimer un compte
        - Réinitialiser mot de passe (RGPD?)
        - **Modifier le statut "certificateur" d'un centre**
        - **Consulter les certifications rattachées (centres certificateurs)**
5. **Suivi de l'activité**
    - Écran : Statistiques générales
    - Graphiques : inscriptions / mise en relation / répartition géographique
    - **Statistiques spécifiques :**
        - **Nombre de centres certificateurs vs centres classiques**
        - **Utilisation des fonctionnalités de messagerie interne**
        - **Taux de transformation contact → demande structurée**
        - **Synchronisations API France Compétence (succès/échecs)**

---

6. **Supervision des certifications**
    - **Écran : Monitoring API France Compétence**
    - **Suivi des synchronisations automatiques**
    - **Alertes en cas d'échec de synchronisation**
    - **Validation manuelle des associations jurys ↔ certifications**

---

### ⚠️ Points de vigilance :

- Avoir une interface de modération rapide et claire
- Ajouter une pagination ou recherche par nom/email pour la validation
- Éventuellement une notification admin à chaque nouveau profil à valider
- **Distinguer clairement les centres certificateurs dans les listes**
- **Surveiller la qualité des données France Compétence**
- **Monitoring des performances de l'API France Compétence**
- **Validation cohérente entre statut déclaré et certifications rattachées**