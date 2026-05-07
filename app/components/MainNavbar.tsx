import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";

const MainNavbar = () => {
  const { auth, isLoading } = usePuterStore();
  const location = useLocation();

  const nextParam = encodeURIComponent(
    location.pathname + location.search,
  );
  const signInHref = `/auth?next=${nextParam}&mode=signin`;
  const signUpHref = `/auth?next=${nextParam}&mode=signup`;

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-100">
      <nav className="flex w-full items-center justify-between gap-4 px-6 py-4 max-w-[88rem] mx-auto">
        <Link
          to="/"
          className="text-2xl font-bold text-gradient shrink-0"
        >
          Cake®Stack
        </Link>

        <div className="flex items-center gap-3">
          {auth.isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-gradient hover:opacity-80 transition px-3 py-1.5"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/upload"
            className="text-sm font-semibold text-gradient hover:opacity-80 transition px-3 py-1.5"
          >
            Upload
          </Link>

          {auth.isAuthenticated ? (
            <>
              {auth.user?.username && (
                <span className="text-sm text-dark-200 hidden sm:inline">
                  {auth.user.username}
                </span>
              )}
              <button
                type="button"
                onClick={auth.signOut}
                disabled={isLoading}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-dark-200 hover:bg-gray-50 transition disabled:opacity-60"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to={signInHref}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-dark-200 hover:bg-gray-50 transition"
              >
                Sign in
              </Link>
              <Link
                to={signUpHref}
                className="primary-gradient text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:opacity-90 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default MainNavbar;
