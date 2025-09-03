import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] to-[#e8faf5]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="https://vbnnjwgfbadvqavqnlhh.supabase.co/storage/v1/object/public/simplyjury-assets/logos/simplyjury-logo.png" 
                alt="SimplyJury Logo" 
                width={150}
                height={48}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/sign-in" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Se connecter
              </Link>
              <Link 
                href="/sign-in" 
                className="bg-[#2563eb] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Créer un compte
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tarifs SimplyJury
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Choisissez le plan qui convient le mieux à vos besoins d'organisme de formation
          </p>
          <p className="text-sm text-gray-500">
            Commission de 20% prélevée sur chaque mission de jury
          </p>
        </div>

        {/* Billing Toggle - Prepared for future annual billing */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
              Mensuel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 rounded-md">
              Annuel (bientôt disponible)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard
            name="Gratuit"
            price={0}
            interval="month"
            isPopular={false}
            features={[
              '1 jury pour tester',
              'Messagerie pour 1 mission',
              'Support par email',
              'Visibilité standard'
            ]}
            limitations={[
              'Pas de tableau de bord complet',
              'Pas d\'exports (Excel, PDF)',
              'Pas de support prioritaire'
            ]}
            buttonText="Commencer gratuitement"
            priceId=""
          />
          <PricingCard
            name="Basic"
            price={39}
            interval="month"
            isPopular={false}
            features={[
              'Jusqu\'à 5 jurys par mois',
              'Messagerie complète',
              'Support par email',
              'Tableau de bord simplifié',
              'Visibilité standard'
            ]}
            buttonText="Choisir Basic"
            priceId=""
          />
          <PricingCard
            name="Pro"
            price={89}
            interval="month"
            isPopular={true}
            features={[
              'Jusqu\'à 15 jurys par mois',
              'Tableau de bord complet',
              'Gestion des certifications',
              'Suivi et traçabilité des missions',
              'Support prioritaire',
              'Exports (Excel, PDF)',
              'Badge "OF Pro vérifié"',
              'Visibilité prioritaire'
            ]}
            buttonText="Choisir Pro"
            priceId=""
          />
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Qui utilise SimplyJury ?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Organismes de Formation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Certificateurs :</strong> Pilotent leurs certifications (clients principaux)</li>
                  <li>• <strong>Partenaires habilités :</strong> Organisent des jurys pour les certificateurs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Jurys Professionnels</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Inscription gratuite</strong></li>
                  <li>• <strong>Rémunération</strong> via les missions</li>
                  <li>• Commission SimplyJury : 20% par mission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SimplyJury. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  name,
  price,
  interval,
  isPopular = false,
  features,
  limitations = [],
  buttonText = "Choisir ce plan",
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  isPopular?: boolean;
  features: string[];
  limitations?: string[];
  buttonText?: string;
  priceId?: string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-8 border-2 relative ${
      isPopular ? 'border-orange-500' : 'border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Recommandé
          </span>
        </div>
      )}
      
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      
      <p className="text-4xl font-medium text-gray-900 mb-6">
        {price === 0 ? 'Gratuit' : `${price}€`}
        {price > 0 && (
          <span className="text-xl font-normal text-gray-600">
            /{interval === 'month' ? 'mois' : interval}
          </span>
        )}
      </p>

      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-3">Inclus :</h4>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {limitations.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-3">Limitations :</h4>
          <ul className="space-y-2">
            {limitations.map((limitation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-400 mr-2 mt-0.5">×</span>
                <span className="text-gray-500 text-sm">{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {price === 0 ? (
        <Link
          href="/sign-in"
          className={`w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
            isPopular ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : ''
          }`}
        >
          {buttonText}
        </Link>
      ) : (
        <form action={checkoutAction}>
          <input type="hidden" name="priceId" value={priceId} />
          <button
            type="submit"
            className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
              isPopular
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {buttonText}
          </button>
        </form>
      )}
    </div>
  );
}
