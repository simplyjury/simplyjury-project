# APIs Mission Apprentissage et France Compétences : Guide complet 2025

L'écosystème français des APIs d'apprentissage révèle **une architecture complexe mais cohérente** où Mission Apprentissage fait office d'interface technique pour des données provenant majoritairement de France Compétences. Cette analyse approfondie dévoile un modèle unique de service public numérique entièrement gratuit, y compris pour un usage commercial, mais soulève des questions importantes sur la pérennité du service.

## Relation et distinction entre les deux APIs

**France Compétences ne propose pas d'API publique directe**. L'institution, créée en 2019 sous tutelle du Ministère du Travail, délègue l'accès technique à ses données via des partenaires spécialisés. Mission Apprentissage joue ce rôle d'interface technique en proposant plusieurs APIs opérationnelles :

- **API principale** : `api.apprentissage.beta.gouv.fr`
- **Tables de correspondances** : `tables-correspondances.apprentissage.beta.gouv.fr` 
- **API Catalogue** : `catalogue.apprentissage.education.gouv.fr`

Ces APIs **utilisent effectivement les données de France Compétences** (RNCP, RS, certifications) qu'elles enrichissent avec d'autres sources officielles : CARIF-OREF, ONISEP, Pôle emploi, et les ministères concernés. Cette approche permet une interopérabilité unique entre les univers formation et emploi.

La seule alternative directe pour accéder aux données France Compétences reste l'**API CARIF-OREF via API Entreprise**, mais elle est réservée aux administrations publiques avec authentification JWT obligatoire.

## Modèle économique : entièrement gratuit, même pour un usage commercial

**L'API Mission Apprentissage est intégralement gratuite**, y compris pour un usage commercial en production. Cette gratuité s'appuie sur la licence ouverte Etalab v2.0 qui autorise explicitement :

- La reproduction et redistribution des données
- L'exploitation commerciale sans restriction
- La création de produits dérivés
- La combinaison avec d'autres données

L'inscription sur `api.apprentissage.beta.gouv.fr` est **gratuite et ouverte à tous**. Elle permet d'obtenir les jetons d'accès nécessaires pour les fonctionnalités avancées, tandis que **les routes de consultation restent publiques sans authentification**. Cette approche hybride optimise l'accès tout en permettant un suivi des usages.

## Sources de données et fiabilité technique

L'API Mission Apprentissage agrège des **données officielles provenant de multiples sources** :

- **France Compétences** : RNCP, RS, niveaux de prise en charge
- **Réseau CARIF-OREF** : formations régionales et certifications
- **ONISEP** : données d'orientation  
- **Pôle emploi** : codes ROME et NAF
- **OPCO** : données sectorielles
- **Ministères** : Education nationale et Travail

L'API effectue un **travail de correspondances complexe** entre les différents référentiels (RNCP/CFD/SISE pour la formation, ROME/NAF pour l'emploi). Cette harmonisation représente sa principale valeur ajoutée technique, permettant des requêtes unifiées sur un écosystème naturellement fragmenté.

Les données sont **mises à jour en temps réel** pour Mission Apprentissage, contre 24-72h pour l'API CARIF-OREF traditionnelle.

## Limitations techniques et considérations pour la production

Les **limitations de requêtes (rate limiting)** ne sont pas précisément documentées, suivant probablement les standards REST usuels. Les retours d'expérience indiquent une architecture robuste avec monitoring intégré et gestion des timeouts (10 secondes maximum).

L'API propose un **système de pagination intelligent** avec métadonnées complètes (page courante, résultats par page, total) et supporte les requêtes géocodées au format "latitude,longitude". Le format JSON reste exclusif avec encodage UTF-8 requis pour les paramètres URL.

**Point critique identifié** : l'API Mission Apprentissage **n'est plus pilotée comme startup d'État depuis mars 2024**. Bien qu'elle reste opérationnelle et maintenue, cette évolution soulève des questions sur les investissements futurs et l'évolution fonctionnelle.

## Différences fonctionnelles et architecturales

| Aspect | API Mission Apprentissage | France Compétences (via tiers) |
|--------|---------------------------|-------------------------------|
| **Accès direct** | ✅ APIs dédiées publiques | ❌ Via partenaires uniquement |
| **Documentation** | ✅ Swagger/GitBook complet | ⚠️ Limitée, via CARIF-OREF |
| **Données couvertes** | Formations, établissements, correspondances | Certifications, habilitations |
| **Mise à jour** | Temps réel | 24-72h |
| **Authentification** | Jeton gratuit optionnel | JWT obligatoire (admin uniquement) |
| **Usage commercial** | ✅ Libre et gratuit | ✅ Via licence ouverte |

Mission Apprentissage excelle dans l'**interopérabilité et la simplicité d'accès**, tandis que les APIs France Compétences via API Entreprise offrent des **garanties administratives renforcées** mais avec des restrictions d'accès.

## Recommandations pour un usage en production commercial

**Pour une plateforme commerciale, l'API Mission Apprentissage reste le choix recommandé** malgré l'arrêt du pilotage startup d'État, pour plusieurs raisons :

1. **Facilité d'intégration** : Documentation complète, endpoints REST standards, pas de processus administratif complexe
2. **Richesse fonctionnelle** : Tables de correspondances uniques dans l'écosystème français
3. **Gratuité confirmée** : Aucun coût même pour usage intensif commercial
4. **Stabilité technique** : Architecture microservices éprouvée, monitoring intégré

**Stratégie d'implémentation recommandée** :
- Commencer par tester les endpoints publics sans authentification
- Créer un compte pour obtenir les jetons d'API avancés
- Implémenter une gestion d'erreurs robuste (codes HTTP standards)
- Prévoir un cache côté client pour les données statiques
- Surveiller les performances via les endpoints `/health` et `/metrics`

**Considérations de risque** : planifier des alternatives techniques compte tenu du changement de statut du projet. Les APIs CARIF-OREF sectorielles ou l'utilisation directe des données ouvertes via data.gouv.fr constituent des options de continuité, bien qu'avec une intégration plus complexe.

L'écosystème français des APIs d'apprentissage offre donc une solution technique mature et gratuite, unique en Europe, mais qui nécessite une veille attentive sur son évolution institutionnelle.