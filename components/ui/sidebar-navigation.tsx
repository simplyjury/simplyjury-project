'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Star, 
  Settings, 
  Crown 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const navigationSections: NavigationSection[] = [
  {
    title: 'NAVIGATION PRINCIPALE',
    items: [
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
    ],
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

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-[#0d4a70] text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#0c608a]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#fdce0f] rounded-full flex items-center justify-center">
            <span className="text-[#0d4a70] font-bold text-sm">✓</span>
          </div>
          <span className="font-bold text-lg">SimplyJury</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-6">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title} className={cn("px-6", sectionIndex > 0 && "mt-8")}>
            <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
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
  );
}
