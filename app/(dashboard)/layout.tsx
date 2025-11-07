'use client';

import Link from 'next/link';
import { use, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, X, Menu, CheckCircle, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarNavigation } from '@/components/ui/sidebar-navigation';
import { signOut } from '@/app/(login)/actions';
import { usePathname, useSearchParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import type { SubscriptionStatus } from '@/lib/types/subscription';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Page title mapping based on routes and user type
const getPageTitle = (pathname: string, isJury: boolean = false, isAdmin: boolean = false): { title: string; subtitle: string } => {
  const adminRoutes = {
    '/dashboard/admin': { title: 'Administration', subtitle: 'Tableau de bord administrateur - Vue d\'ensemble de la plateforme' },
    '/dashboard/admin/validation-profils': { title: 'Tâches à valider', subtitle: 'Gérez les demandes de validation des profils et certifications' },
    '/dashboard/admin/gestion-utilisateurs': { title: 'Gestion utilisateurs', subtitle: 'Administrez les comptes utilisateurs de la plateforme' },
    '/dashboard/admin/sessions': { title: 'Gestion des sessions', subtitle: 'Gérez toutes les sessions de jury de la plateforme' },
    '/dashboard/admin/repartition-geographique': { title: 'Répartition géographique', subtitle: 'Analysez la distribution géographique des utilisateurs' },
    '/dashboard/admin/export-donnees': { title: 'Export données', subtitle: 'Exportez les données de la plateforme' },
    '/dashboard/admin/parametres': { title: 'Paramètres système', subtitle: 'Configurez les paramètres de la plateforme' },
    '/dashboard/admin/logs-activite': { title: 'Logs d\'activité', subtitle: 'Consultez les journaux d\'activité du système' },
  };

  const centerRoutes = {
    '/dashboard': { title: 'Tableau de bord', subtitle: 'Bonjour ! Voici un aperçu de votre activité sur SimplyJury' },
    '/dashboard/search': { title: 'Rechercher un jury', subtitle: 'Trouvez le jury parfait pour votre certification' },
    '/dashboard/messages': { title: 'Messagerie', subtitle: 'Gérez vos conversations avec les jurys' },
    '/dashboard/requests': { title: 'Mes demandes', subtitle: 'Suivez vos demandes en cours' },
    '/dashboard/certifications': { title: 'Mes certifications', subtitle: 'Gérez vos certifications et synchronisations' },
    '/dashboard/sessions': { title: 'Sessions réalisées', subtitle: 'Consultez l\'historique de vos examens' },
    '/dashboard/reviews': { title: 'Avis', subtitle: 'Consultez les avis donnés et reçus' },
    '/dashboard/settings': { title: 'Paramètres', subtitle: 'Configurez votre compte' },
    '/dashboard/upgrade': { title: 'Passer au Pro', subtitle: 'Découvrez nos offres premium' },
    '/dashboard/profile': { title: 'Mon profil', subtitle: 'Gérez vos informations personnelles et professionnelles' },
  };

  const juryRoutes = {
    '/dashboard': { title: 'Tableau de bord', subtitle: 'Bonjour ! Voici un aperçu de votre activité sur SimplyJury' },
    '/dashboard/requests': { title: 'Mes demandes', subtitle: 'Consultez les demandes de missions reçues' },
    '/dashboard/messages': { title: 'Messagerie', subtitle: 'Gérez vos conversations avec les centres de formation' },
    '/dashboard/jury/centres': { title: 'Annuaire des centres de formation', subtitle: 'Contactez directement les centres pour proposer vos services de jury professionnel' },
    '/dashboard/missions': { title: 'Missions réalisées', subtitle: 'Consultez l\'historique de vos missions' },
    '/dashboard/evaluations': { title: 'Mes évaluations', subtitle: 'Consultez les avis reçus' },
    '/dashboard/profile': { title: 'Mon profil', subtitle: 'Gérez vos informations personnelles et professionnelles' },
    '/dashboard/settings': { title: 'Paramètres', subtitle: 'Configurez votre compte' },
    '/dashboard/help': { title: 'Aide & Support', subtitle: 'Trouvez de l\'aide et contactez le support' },
  };
  
  if (isAdmin) {
    return adminRoutes[pathname as keyof typeof adminRoutes] || { title: 'Administration', subtitle: '' };
  }
  
  const routes = isJury ? juryRoutes : centerRoutes;
  return routes[pathname as keyof typeof routes] || { title: 'Dashboard', subtitle: '' };
};

function FreemiumBanner({ onClose, subscriptionStatus }: { onClose: () => void; subscriptionStatus: SubscriptionStatus | null }) {
  if (!subscriptionStatus) return null;
  
  const tierNames = {
    gratuit: 'Plan Gratuit',
    basic: 'Plan Basic',
    pro: 'Plan Pro'
  };
  
  const tierName = tierNames[subscriptionStatus.tier] || 'Plan Gratuit';
  const isAtLimit = subscriptionStatus.isAtLimit;
  const hasPremium = subscriptionStatus.hasPremiumAccess;
  
  // Don't show banner for Pro tier (unless they want to see it)
  if (subscriptionStatus.tier === 'pro' && !hasPremium) {
    return null;
  }
  
  return (
    <div className={`border-l-4 px-4 py-3 flex items-center justify-between ${
      isAtLimit 
        ? 'bg-red-50 border-red-400' 
        : hasPremium 
        ? 'bg-purple-50 border-purple-400'
        : 'bg-[#fdce0f] border-[#f4b942]'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={isAtLimit ? 'text-red-600' : hasPremium ? 'text-purple-600' : 'text-[#0d4a70]'}>
          {hasPremium ? '✨' : isAtLimit ? '⚠️' : '⭐'}
        </div>
        <div>
          <div className={`font-semibold text-sm ${
            isAtLimit ? 'text-red-700' : hasPremium ? 'text-purple-700' : 'text-[#0d4a70]'
          }`}>
            {hasPremium ? (
              `Accès Premium Actif - ${subscriptionStatus.contactsRemaining}/${subscriptionStatus.contactsLimit} contacts restants`
            ) : (
              `${tierName} - ${subscriptionStatus.contactsRemaining}/${subscriptionStatus.contactsLimit} contact${subscriptionStatus.contactsLimit > 1 ? 's' : ''} restant${subscriptionStatus.contactsRemaining > 1 ? 's' : ''}`
            )}
          </div>
          <div className={`text-xs ${
            isAtLimit ? 'text-red-600' : hasPremium ? 'text-purple-600' : 'text-[#0d4a70]'
          }`}>
            {isAtLimit 
              ? 'Limite atteinte - Passez au plan supérieur pour continuer' 
              : hasPremium
              ? `Expire le ${new Date(subscriptionStatus.premiumAccessExpiresAt!).toLocaleDateString('fr-FR')}`
              : 'Débloquez plus de contacts avec le plan Pro'
            }
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {!hasPremium && subscriptionStatus.tier !== 'pro' && (
          <Link href="/pricing">
            <Button 
              size="sm" 
              className={`text-white text-xs px-3 py-1 ${
                isAtLimit 
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#0d4a70] hover:bg-[#0c608a]'
              }`}
            >
              {isAtLimit ? 'Upgrade maintenant' : 'Découvrir Pro'}
            </Button>
          </Link>
        )}
        <button
          onClick={onClose}
          className={`p-1 ${
            isAtLimit ? 'text-red-600 hover:text-red-700' : hasPremium ? 'text-purple-600 hover:text-purple-700' : 'text-[#0d4a70] hover:text-[#0c608a]'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [juryPhotoUrl, setJuryPhotoUrl] = useState<string | null>(null);
  const [centerLogoUrl, setCenterLogoUrl] = useState<string | null>(null);
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: centerProfile } = useSWR(
    user?.userType === 'centre' ? '/api/profile/center' : null, 
    fetcher
  );
  const { data: juryProfile } = useSWR(
    user?.userType === 'jury' ? '/api/profile/jury' : null, 
    fetcher
  );
  const router = useRouter();

  // Fetch jury photo URL
  useEffect(() => {
    if (juryProfile?.data?.profilePhotoUrl) {
      fetch('/api/profile/jury/photo-url')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setJuryPhotoUrl(data.url);
          }
        })
        .catch(err => console.error('Failed to get jury photo URL:', err));
    }
  }, [juryProfile?.data?.profilePhotoUrl]);

  // Fetch center logo URL
  useEffect(() => {
    if (centerProfile?.data?.logoUrl) {
      fetch('/api/profile/center/logo-url')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCenterLogoUrl(data.url);
          }
        })
        .catch(err => console.error('Failed to get center logo URL:', err));
    }
  }, [centerProfile?.data?.logoUrl]);

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Pricing
        </Link>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Se connecter
        </Link>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">Créer un compte</Link>
        </Button>
      </>
    );
  }

  // Determine which profile to display based on what's available
  const activeProfile = juryProfile?.data || centerProfile?.data;
  const profileName = activeProfile?.firstName && activeProfile?.lastName 
    ? `${activeProfile.firstName} ${activeProfile.lastName}`
    : activeProfile?.name;
  
  // Use the appropriate image based on user type
  const displayImage = user?.userType === 'jury' ? juryPhotoUrl : centerLogoUrl;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        {profileName && (
          <div className="text-sm font-medium text-gray-900">
            {profileName}
          </div>
        )}
        <div className="flex items-center justify-end space-x-1 text-xs text-gray-500">
          {user.validationStatus === 'validated' ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-[#13d090]" />
              <span>Compte vérifié</span>
            </>
          ) : user.validationStatus === 'pending' ? (
            <>
              <Clock className="h-3.5 w-3.5 text-yellow-500" />
              <span>Validation en attente</span>
            </>
          ) : user.validationStatus === 'rejected' ? (
            <>
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <span>Compte rejeté</span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-yellow-500" />
              <span>Statut en cours de vérification</span>
            </>
          )}
        </div>
      </div>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer size-10">
            <AvatarImage src={displayImage || undefined} alt={profileName || user.email} />
            <AvatarFallback className="bg-[#13d090] text-white font-semibold">
              {profileName 
                ? profileName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                : user.email.split('@')[0].substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="flex flex-col gap-1">
          <DropdownMenuItem className="cursor-pointer">
            <Link href="/dashboard" className="flex w-full items-center">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <form action={handleSignOut} className="w-full">
            <button type="submit" className="flex w-full">
              <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function HeaderContent({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showBanner, setShowBanner] = useState(true);
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: centerProfile } = useSWR(
    user?.userType === 'centre' ? '/api/profile/center' : null, 
    fetcher
  );
  const { data: juryProfile } = useSWR(
    user?.userType === 'jury' ? '/api/profile/jury' : null, 
    fetcher
  );
  
  // Epic 07: Fetch subscription status for training centers
  const { data: subscriptionData } = useSWR(
    user?.userType === 'centre' ? '/api/subscription/status' : null,
    fetcher
  );
  
  // Determine user type based on URL parameter or user.userType
  const isJury = searchParams.get('profile') === 'jury' || 
                 (user?.userType === 'jury' && !searchParams.get('profile'));
  
  const isAdmin = user?.userType === 'admin';
  
  const { title, subtitle } = getPageTitle(pathname, isJury, isAdmin);
  const subscriptionStatus = subscriptionData?.data || null;
  const showSubscriptionBanner = user?.userType === 'centre' && subscriptionStatus;
  

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden mr-4 p-2 rounded-md text-[#0d4a70] hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-[#0d4a70]">{title}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Suspense fallback={<div className="h-10" />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </header>
      {showSubscriptionBanner && showBanner && (
        <FreemiumBanner 
          onClose={() => setShowBanner(false)} 
          subscriptionStatus={subscriptionStatus}
        />
      )}
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Suspense fallback={<div className="w-64 bg-white border-r border-gray-200" />}>
        <SidebarNavigation 
          isOpen={isMobileMenuOpen} 
          onClose={closeMobileMenu}
          className="lg:block"
        />
      </Suspense>
      <div className="flex-1 flex flex-col lg:ml-0">
        <Suspense fallback={<div className="h-16 border-b border-gray-200 bg-white" />}>
          <HeaderContent onMenuToggle={toggleMobileMenu} />
        </Suspense>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
