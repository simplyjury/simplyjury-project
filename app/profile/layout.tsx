import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 font-jakarta">
      {/* Minimal header for profile completion */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logos/SimplyJury_Logo-Horizontal-Bicolore-Bleu-Jaune.svg"
              alt="SimplyJury"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Étape de configuration</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/sign-out">Se déconnecter</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area without sidebar */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
