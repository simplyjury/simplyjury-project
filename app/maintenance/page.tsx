import Image from 'next/image';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f9] to-[#e8faf5] flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="mb-6">
            <Image 
              src="https://vbnnjwgfbadvqavqnlhh.supabase.co/storage/v1/object/public/simplyjury-assets/logos/simplyjury-logo.png" 
              alt="SimplyJury Logo" 
              width={200}
              height={64}
              className="mx-auto"
              priority
            />
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#13d090] bg-opacity-10 rounded-full mb-4">
              <svg className="w-8 h-8 text-[#13d090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#0d4a70] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Maintenance en cours
            </h2>
            <p className="text-lg text-[#0d4a70] leading-relaxed mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Notre plateforme est temporairement indisponible pour des améliorations techniques.
            </p>
          </div>

          {/* Decorative highlight line */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#13d090] opacity-30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[#13d090] font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Nous revenons bientôt
              </span>
            </div>
          </div>

          <p className="text-[#0d4a70] opacity-80 mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Nous mettons tout en œuvre pour rétablir le service dans les plus brefs délais. 
            Merci de votre patience et de votre compréhension.
          </p>

          {/* Contact info */}
          <div className="bg-[#edf6f9] rounded-xl p-4">
            <p className="text-sm text-[#0d4a70] font-medium mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Une question urgente ?
            </p>
            <p className="text-sm text-[#0d4a70]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Contactez-nous à{' '}
              <a href="mailto:support@simplyjury.com" className="text-[#13d090] hover:underline font-medium">
                support@simplyjury.com
              </a>
            </p>
          </div>
        </div>

        {/* Geometric decorative elements */}
        <div className="flex justify-center space-x-4 opacity-60">
          <div className="w-3 h-3 bg-[#fdce0f] rounded-full"></div>
          <div className="w-3 h-3 bg-[#13d090] rounded-full"></div>
          <div className="w-3 h-3 bg-[#bea1e5] rounded-full"></div>
        </div>
      </div>

      {/* Background decorative shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#fdce0f] opacity-10 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-[#bea1e5] opacity-10 rounded-lg"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-[#13d090] opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-[#0d4a70] opacity-5 rounded-lg"></div>
      </div>
    </div>
  );
}
