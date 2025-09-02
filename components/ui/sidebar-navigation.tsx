'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Star, 
  Settings, 
  Crown,
  Award,
  Menu,
  X,
  CheckCircle,
  User,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';
import { useState, useEffect } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getNavigationSections(userType: 'jury' | 'center', isCertificateur: boolean): NavigationSection[] {
  if (userType === 'jury') {
    // Navigation for jury profiles
    return [
      {
        title: 'NAVIGATION PRINCIPALE',
        items: [
          {
            name: 'Tableau de bord',
            href: '/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'Mes demandes',
            href: '/dashboard/requests',
            icon: FileText,
            badge: 2,
          },
          {
            name: 'Messagerie',
            href: '/dashboard/messages',
            icon: MessageSquare,
          },
        ],
      },
      {
        title: 'MES MISSIONS',
        items: [
          {
            name: 'Missions réalisées',
            href: '/dashboard/missions',
            icon: CheckCircle,
          },
          {
            name: 'Mes évaluations',
            href: '/dashboard/evaluations',
            icon: Star,
          },
        ],
      },
      {
        title: 'MON COMPTE',
        items: [
          {
            name: 'Mon profil',
            href: '/dashboard/profile',
            icon: User,
          },
          {
            name: 'Paramètres',
            href: '/dashboard/settings',
            icon: Settings,
          },
          {
            name: 'Aide & Support',
            href: '/dashboard/help',
            icon: HelpCircle,
          },
        ],
      },
    ];
  } else {
    // Navigation for training centers
    const baseMainNavigation = [
      {
        name: 'Tableau de bord',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Rechercher un jury',
        href: '/dashboard/search',
        icon: Search,
      },
      {
        name: 'Messagerie',
        href: '/dashboard/messages',
        icon: MessageSquare,
        badge: 3,
      },
      {
        name: 'Mes demandes',
        href: '/dashboard/requests',
        icon: FileText,
      },
    ];

    // Add "Mes certifications" for certificateur centers only
    if (isCertificateur) {
      baseMainNavigation.push({
        name: 'Mes certifications',
        href: '/dashboard/certifications',
        icon: Award,
      });
    }

    return [
      {
        title: 'NAVIGATION PRINCIPALE',
        items: baseMainNavigation,
      },
      {
        title: 'HISTORIQUE',
        items: [
          {
            name: 'Sessions réalisées',
            href: '/dashboard/sessions',
            icon: Calendar,
          },
          {
            name: 'Avis donnés',
            href: '/dashboard/reviews',
            icon: Star,
          },
        ],
      },
      {
        title: 'MON COMPTE',
        items: [
          {
            name: 'Paramètres',
            href: '/dashboard/settings',
            icon: Settings,
          },
          {
            name: 'Passer au Pro',
            href: '/dashboard/upgrade',
            icon: Crown,
          },
        ],
      },
    ];
  }
}

interface SidebarNavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function SidebarNavigation({ isOpen = true, onClose, className }: SidebarNavigationProps) {
  const pathname = usePathname();
  const { data: centerProfile } = useSWR('/api/profile/center', fetcher);
  const { data: juryProfile } = useSWR('/api/profile/jury', fetcher);
  
  // Determine user type and certificateur status
  const userType: 'jury' | 'center' = juryProfile?.data ? 'jury' : 'center';
  const isCertificateur = centerProfile?.data?.isCertificateur || false;
  
  // Get navigation sections based on user type and certificateur status
  const navigationSections = getNavigationSections(userType, isCertificateur);

  // Close mobile menu when clicking on a link
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <nav className={cn(
        "bg-[#0d4a70] text-white min-h-screen flex flex-col transition-transform duration-300 ease-in-out z-50",
        "w-64 fixed lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Mobile close button */}
        {onClose && (
          <div className="lg:hidden p-4 flex justify-end">
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Logo */}
        <div className="p-6 border-b border-[#0c608a]">
          <div className="flex items-center justify-center">
            <Image
              src="https://vbnnjwgfbadvqavqnlhh.supabase.co/storage/v1/object/public/simplyjury-assets/logos/SimplyJury_Logo-Horizontal-Bicolore-Blanc-Jaune.png"
              alt="SimplyJury"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 py-6">
          {navigationSections.map((section: NavigationSection, sectionIndex: number) => (
            <div key={section.title} className={cn("px-6", sectionIndex > 0 && "mt-8")}>
              <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item: NavigationItem) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                          isActive
                            ? "bg-[#13d090] text-white"
                            : "text-gray-300 hover:bg-[#0c608a] hover:text-white"
                        )}
                      >
                        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="ml-2 bg-[#fdce0f] text-[#0d4a70] text-xs font-bold px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
