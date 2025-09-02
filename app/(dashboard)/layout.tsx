'use client';

import Link from 'next/link';
import { use, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleIcon, Home, LogOut, X, Menu } from 'lucide-react';
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
import { usePathname } from 'next/navigation';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Page title mapping based on routes
const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
  const routes = {
    '/dashboard': { title: 'Tableau de bord', subtitle: 'Bonjour ! Voici un aperçu de votre activité sur SimplyJury' },
    '/dashboard/search': { title: 'Rechercher un jury', subtitle: 'Trouvez le jury parfait pour votre certification' },
    '/dashboard/messages': { title: 'Messagerie', subtitle: 'Gérez vos conversations avec les jurys' },
    '/dashboard/requests': { title: 'Mes demandes', subtitle: 'Suivez vos demandes en cours' },
    '/dashboard/certifications': { title: 'Mes certifications', subtitle: 'Gérez vos certifications et synchronisations' },
    '/dashboard/sessions': { title: 'Sessions réalisées', subtitle: 'Consultez l\'historique de vos examens' },
    '/dashboard/reviews': { title: 'Avis donnés', subtitle: 'Consultez les avis reçus' },
    '/dashboard/settings': { title: 'Paramètres', subtitle: 'Configurez votre compte' },
    '/dashboard/upgrade': { title: 'Passer au Pro', subtitle: 'Découvrez nos offres premium' },
  };
  
  return routes[pathname as keyof typeof routes] || { title: 'Dashboard', subtitle: '' };
};

function FreemiumBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-[#fdce0f] border-l-4 border-[#f4b942] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="text-[#0d4a70]">⭐</div>
        <div>
          <div className="text-[#0d4a70] font-semibold text-sm">
            Plan Gratuit - 1 mise en relation restante
          </div>
          <div className="text-[#0d4a70] text-xs">
            Débloquez tous les contacts avec le plan Pro
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          size="sm" 
          className="bg-[#0d4a70] hover:bg-[#0c608a] text-white text-xs px-3 py-1"
        >
          Découvrir Pro
        </Button>
        <button
          onClick={onClose}
          className="text-[#0d4a70] hover:text-[#0c608a] p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: centerProfile } = useSWR('/api/profile/center', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  const router = useRouter();

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
  const profileImage = activeProfile?.logoUrl; // Only use logoUrl for training centers
  
  // For jury profiles, we need to fetch signed URL
  const [juryPhotoUrl, setJuryPhotoUrl] = useState<string | null>(null);
  
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
  
  const displayImage = juryPhotoUrl || profileImage;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        {profileName && (
          <div className="text-sm font-medium text-gray-900">
            {profileName}
          </div>
        )}
        <div className="text-xs text-gray-500">
          {user.email}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>✅ Compte vérifié</span>
        </div>
      </div>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer size-10">
            <AvatarImage src={displayImage} alt={profileName || user.email} />
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

function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(true);
  const { data: centerProfile } = useSWR('/api/profile/center', fetcher);
  
  const { title, subtitle } = getPageTitle(pathname);
  const isFreemium = centerProfile?.data?.subscriptionTier === 'gratuit';
  

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
              <h1 className="text-xl font-semibold text-[#0d4a70] mb-1">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {!isFreemium && (
              <Button className="bg-[#0d4a70] hover:bg-[#0c608a] text-white hidden sm:block">
                Passer au Pro
              </Button>
            )}
            <Suspense fallback={<div className="h-10" />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </header>
      {isFreemium && showBanner && (
        <FreemiumBanner onClose={() => setShowBanner(false)} />
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
      <SidebarNavigation 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu}
        className="lg:block"
      />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header onMenuToggle={toggleMobileMenu} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
