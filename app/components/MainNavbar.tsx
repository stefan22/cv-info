import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { usePuterStore } from '~/lib/puter';

/** Identical bar markup to netlify-blog `components/Header.js` (lines 50–57). */
function MobileMenuIcon({ open }: { open: boolean }) {
  return (
    <div className="flex h-5 w-6 flex-col items-end justify-between" aria-hidden>
      <span
        className={`h-0.5 bg-current transition-all duration-300 ${
          open ? 'w-6 translate-y-2.5 rotate-45' : 'w-6'
        }`}
      />
      <span
        className={`h-0.5 bg-current transition-all duration-200 ${
          open ? 'opacity-0' : 'w-4'
        }`}
      />
      <span
        className={`h-0.5 bg-current transition-all duration-300 ${
          open ? 'w-6 -translate-y-2 -rotate-45' : 'w-5'
        }`}
      />
    </div>
  );
}

const MainNavbar = () => {
  const { auth, isLoading } = usePuterStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuHasOpened, setMobileMenuHasOpened] = useState(false);

  /**
   * Opening: blog-style stagger from below (opacity + translate).
   * After first open, closing keeps rows fully opaque with no motion so the outer
   * grid height collapse reads as a roll-up, not a fade-away.
   */
  const blogMobileRow = (open: boolean, delayClass: string, extra?: string) => {
    const base = `block w-full text-right text-sm font-semibold leading-snug text-neutral-900 border-b border-neutral-900/25 pb-1.5 pt-2 hover:text-[#606beb] ${extra ?? ''}`;
    if (open) {
      return `${base} translate-y-0 opacity-100 transition-all duration-400 ${delayClass}`;
    }
    if (mobileMenuHasOpened) {
      return `${base} translate-y-0 opacity-100 transition-none`;
    }
    return `${base} translate-y-3 opacity-0 transition-none`;
  };

  const nextParam = encodeURIComponent(location.pathname + location.search);
  const signInHref = `/auth?next=${nextParam}&mode=signin`;
  const signUpHref = `/auth?next=${nextParam}&mode=signup`;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (mobileOpen) {setMobileMenuHasOpened(true);}
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {return;}
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {setMobileOpen(false);}
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-[200] relative w-full border-b border-gray-100 bg-white">
      <nav className="relative z-[220] mx-auto flex w-full max-w-352 items-center justify-between gap-4 bg-white px-6 py-4 text-neutral-900">
        <Link
          to="/"
          className="inline-block text-2xl font-semibold text-neutral-900"
          onClick={closeMobile}>
          Cake<span className="text-sm text-yellow-600">®</span>Stack
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {auth.isAuthenticated && (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 text-sm font-semibold text-neutral-900 transition hover:opacity-80">
              Dashboard
            </Link>
          )}
          <Link
            to="/upload"
            className="px-3 py-1.5 text-sm font-semibold text-neutral-900 transition hover:opacity-80">
            Upload
          </Link>

          {auth.isAuthenticated ?
            <>
              {auth.user?.username && (
                <span className="hidden text-sm text-neutral-600 sm:inline">
                  {auth.user.username}
                </span>
              )}
              <button
                type="button"
                onClick={auth.signOut}
                disabled={isLoading}
                className="primary-button !w-auto !px-6 whitespace-nowrap">
                Sign out
              </button>
            </>
          : <>
              <Link
                to={signInHref}
                className="signin-button !w-auto !px-6 whitespace-nowrap">
                Sign in
              </Link>
              <Link
                to={signUpHref}
                className="primary-button !w-auto !px-6 whitespace-nowrap">
                Sign up
              </Link>
            </>
          }
        </div>

        <button
          type="button"
          className="p-2 text-neutral-600 transition-colors hover:bg-neutral-100 rounded-lg md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
          <MobileMenuIcon open={mobileOpen} />
        </button>
      </nav>

      {/* Blog-style grid/opacity animation, but absolutely positioned so main content does not reflow (blog uses fixed header to get the same effect). */}
      <div
        id="mobile-nav-menu"
        className={`absolute left-0 right-0 top-full z-[210] md:hidden ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}>
        <div
          className={`grid w-full overflow-hidden border-b border-neutral-100 bg-white shadow-2xl motion-reduce:transition-none ${
            mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          } transition-[grid-template-rows] duration-[520ms] ease-in-out`}>
          <div className="min-h-0">
            <nav
              className="mx-auto flex w-full max-w-352 flex-col gap-4 px-6 pb-5 pt-6 text-right"
              aria-label="Mobile">
            <Link
              to="/upload"
              className={blogMobileRow(mobileOpen, 'delay-150')}
              onClick={closeMobile}>
              Upload
            </Link>

            {auth.isAuthenticated ?
              <>
                <Link
                  to="/dashboard"
                  className={blogMobileRow(mobileOpen, 'delay-200')}
                  onClick={closeMobile}>
                  Dashboard
                </Link>
                {auth.user?.username && (
                  <p
                    className={blogMobileRow(
                      mobileOpen,
                      'delay-300',
                      'font-medium text-neutral-600',
                    )}>
                    {auth.user.username}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    void auth.signOut();
                  }}
                  disabled={isLoading}
                  className={blogMobileRow(
                    mobileOpen,
                    auth.user?.username ? 'delay-500' : 'delay-300',
                    'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                  )}>
                  Sign out
                </button>
              </>
            : <>
                <Link
                  to={signInHref}
                  className={blogMobileRow(mobileOpen, 'delay-300')}
                  onClick={closeMobile}>
                  Sign in
                </Link>
                <Link
                  to={signUpHref}
                  className={blogMobileRow(mobileOpen, 'delay-500')}
                  onClick={closeMobile}>
                  Sign up
                </Link>
              </>
            }
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainNavbar;
