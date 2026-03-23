export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ---- Left panel: product showcase ---- */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex-col justify-between p-12">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />

        {/* Glow blobs */}
        <div className="absolute top-1/4 -left-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-1/4 right-0 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20 backdrop-blur">
              <svg className="h-4 w-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-primary-foreground">ProPilot</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary-foreground leading-tight">
              Win more proposals
              <br />
              with AI intelligence
            </h1>
            <p className="text-base text-primary-foreground/80 leading-relaxed max-w-md">
              Draft, send, and track proposals with real-time analytics. Know exactly
              when prospects open your proposals and which sections they spend the most time on.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'AI-powered proposal drafting in minutes',
              'Section-level engagement analytics',
              'Interactive pricing tables that convert',
              'E-signature and one-click accept',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-primary-foreground/90">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                  <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="rounded-xl bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 p-4">
            <p className="text-sm text-primary-foreground/90 leading-relaxed italic">
              &ldquo;ProPilot helped us increase our proposal win rate from 28% to 51% in 90 days.
              The section analytics alone are worth the subscription.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/30 text-primary-foreground text-[10px] font-bold">
                SJ
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-foreground">Sarah J.</p>
                <p className="text-[10px] text-primary-foreground/70">CEO, Venture Creative Agency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="relative z-10">
          <p className="text-xs text-primary-foreground/60 mb-2">Trusted by 500+ agencies worldwide</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3.5 w-3.5 text-secondary fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="ml-2 text-xs text-primary-foreground/70">4.9/5 from 200+ reviews</span>
          </div>
        </div>
      </div>

      {/* ---- Right panel: auth form ---- */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
