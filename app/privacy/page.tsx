'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/logos/SimplyJury_Logo-Horizontal-Bicolore-Bleu-Jaune.svg"
                alt="SimplyJury"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <Button asChild variant="outline" className="border-[#0d4a70] text-[#0d4a70] hover:bg-[#0d4a70] hover:text-white rounded-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#edf6f9] to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0d4a70] rounded-full mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#0d4a70] mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-gray-600">
              Dernière mise à jour : 15 octobre 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none space-y-8">
            
            {/* Introduction */}
            <div className="bg-[#0d4a70]/5 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                SimplyJury s'engage à protéger la vie privée et les données personnelles de ses utilisateurs. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et 
                protégeons vos informations personnelles conformément au Règlement Général sur la Protection 
                des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
            </div>

            {/* Section 1 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">1. Responsable du traitement</h2>
              <p className="text-gray-700 mb-4">
                Le responsable du traitement des données personnelles est :
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 mb-2"><strong>SimplyJury</strong></p>
                <p className="text-gray-700 mb-2">Email : contact@simplyjury.com</p>
                <p className="text-gray-700">
                  Pour toute question relative à la protection de vos données personnelles, 
                  vous pouvez nous contacter à l'adresse : privacy@simplyjury.com
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">2. Données collectées</h2>
              
              <h3 className="text-xl font-semibold text-[#0d4a70] mb-3">2.1 Données d'identification</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li><strong>Pour tous les utilisateurs :</strong> nom, prénom, adresse email, mot de passe (crypté), type de compte</li>
                <li><strong>Pour les centres de formation :</strong> nom de l'établissement, numéro SIRET, adresse, téléphone, contact référent, certification Qualiopi</li>
                <li><strong>Pour les jurys professionnels :</strong> photo de profil, région, domaines d'expertise, certifications, expériences, disponibilités</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0d4a70] mb-3">2.2 Données de navigation</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Adresse IP, type de navigateur, pages visitées, date et heure de connexion</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0d4a70] mb-3">2.3 Newsletter</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Adresse email, préférences de communication, date d'inscription et de confirmation</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">3. Finalités et bases légales</h2>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-[#0d4a70] mb-2">Gestion des comptes</h4>
                  <p className="text-gray-700 text-sm"><strong>Base légale :</strong> Exécution du contrat</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-[#0d4a70] mb-2">Mise en relation</h4>
                  <p className="text-gray-700 text-sm"><strong>Base légale :</strong> Exécution du contrat</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-[#0d4a70] mb-2">Newsletter</h4>
                  <p className="text-gray-700 text-sm"><strong>Base légale :</strong> Consentement (désinscription possible à tout moment)</p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">4. Destinataires des données</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Personnel autorisé de SimplyJury</strong></li>
                <li><strong>Autres utilisateurs :</strong> profils publics visibles selon les fonctionnalités</li>
                <li><strong>Prestataires techniques :</strong> Supabase (hébergement), Resend (emails), Stripe (paiements) - tous conformes RGPD</li>
                <li><strong>Autorités compétentes :</strong> en cas d'obligation légale</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Nous ne vendons ni ne louons vos données personnelles à des tiers.
              </p>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">5. Durée de conservation</h2>
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-700 text-sm"><strong>Comptes actifs :</strong> Pendant toute la durée d'utilisation</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-700 text-sm"><strong>Comptes inactifs :</strong> 3 ans après la dernière connexion</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-700 text-sm"><strong>Newsletter :</strong> Jusqu'à désinscription ou 3 ans d'inactivité</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-700 text-sm"><strong>Données de facturation :</strong> 10 ans (obligation légale)</p>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">6. Sécurité des données</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Chiffrement HTTPS et mots de passe cryptés (bcrypt)</li>
                <li>Authentification sécurisée avec tokens JWT</li>
                <li>Hébergement dans l'Union Européenne</li>
                <li>Sauvegardes quotidiennes automatiques</li>
                <li>Accès restreint au personnel autorisé</li>
                <li>Mises à jour régulières de sécurité</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">7. Vos droits</h2>
              <p className="text-gray-700 mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-[#13d090]/10 rounded-xl p-3">
                  <p className="font-semibold text-[#0d4a70] text-sm">✓ Droit d'accès</p>
                </div>
                <div className="bg-[#13d090]/10 rounded-xl p-3">
                  <p className="font-semibold text-[#0d4a70] text-sm">✓ Droit de rectification</p>
                </div>
                <div className="bg-[#13d090]/10 rounded-xl p-3">
                  <p className="font-semibold text-[#0d4a70] text-sm">✓ Droit à l'effacement</p>
                </div>
                <div className="bg-[#13d090]/10 rounded-xl p-3">
                  <p className="font-semibold text-[#0d4a70] text-sm">✓ Droit à la portabilité</p>
                </div>
                <div className="bg-[#13d090]/10 rounded-xl p-3">
                  <p className="font-semibold text-[#0d4a70] text-sm">✓ Droit d'opposition</p>
                </div>
                <div className="bg-[#13d090]/10 rounded-xl p-3">
                  <p className="font-semibold text-[#0d4a70] text-sm">✓ Droit de retirer le consentement</p>
                </div>
              </div>

              <div className="bg-[#0d4a70]/5 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-[#0d4a70] mb-3">Comment exercer vos droits ?</h4>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Par email : <a href="mailto:privacy@simplyjury.com" className="text-[#0d4a70] underline">privacy@simplyjury.com</a></li>
                  <li>Depuis votre compte : Section "Paramètres" &gt; "Confidentialité"</li>
                </ul>
                <p className="text-gray-700 mt-3 text-sm">
                  Délai de réponse : 1 mois maximum
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">8. Cookies</h2>
              <p className="text-gray-700 mb-3">
                Notre site utilise des cookies strictement nécessaires (authentification, sécurité) et des cookies de performance (analyse d'utilisation).
              </p>
              <p className="text-gray-700">
                Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels.
              </p>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">9. Réclamation</h2>
              <p className="text-gray-700 mb-4">
                Vous pouvez introduire une réclamation auprès de la CNIL :
              </p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 text-sm mb-1"><strong>CNIL</strong></p>
                <p className="text-gray-700 text-sm mb-1">3 Place de Fontenoy - TSA 80715</p>
                <p className="text-gray-700 text-sm mb-1">75334 PARIS CEDEX 07</p>
                <p className="text-gray-700 text-sm mb-1">Tél : 01 53 73 22 22</p>
                <p className="text-gray-700 text-sm">Site : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#0d4a70] underline">www.cnil.fr</a></p>
              </div>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d4a70] mb-4">10. Contact</h2>
              <div className="bg-[#0d4a70]/5 rounded-xl p-6">
                <p className="text-gray-700 mb-2"><strong>Email :</strong> <a href="mailto:privacy@simplyjury.com" className="text-[#0d4a70] underline">privacy@simplyjury.com</a></p>
                <p className="text-gray-700"><strong>Support :</strong> <a href="mailto:contact@simplyjury.com" className="text-[#0d4a70] underline">contact@simplyjury.com</a></p>
              </div>
            </div>

            {/* Footer note */}
            <div className="bg-gradient-to-r from-[#0d4a70] to-[#0c608a] rounded-2xl p-6 text-white">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Votre confiance est notre priorité</h3>
                  <p className="text-blue-100 text-sm">
                    Chez SimplyJury, nous prenons la protection de vos données très au sérieux. 
                    Nous mettons tout en œuvre pour garantir la sécurité et la confidentialité de vos informations personnelles 
                    conformément aux normes les plus strictes du RGPD.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
