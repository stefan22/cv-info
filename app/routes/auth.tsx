import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Cake®Stack | Sign in" },
  { name: "description", content: "Sign in or create an account" },
];

type AuthMode = "signin" | "signup";

const authLabelClass = "text-sm max-sm:pl-[5px]";

const authHelperIndent = "max-sm:pl-[5px]";

/** Match auth CTAs: 48px height (h-12) like primary / OAuth buttons. */
const authInputClass =
  "box-border h-12 w-full min-w-0 max-sm:!w-full max-sm:max-w-none max-sm:px-4 max-sm:text-base self-stretch rounded-md border border-solid border-[#dadce0] bg-white px-3 py-2 text-sm leading-snug focus:border-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100";

const Auth = () => {
  const { isLoading, auth, error, clearError } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const next = useMemo(() => {
    const raw = params.get("next");
    if (!raw) {
      return "/";
    }
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
    return "/";
  }, [params]);

  const initialMode: AuthMode =
    params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      void navigate(next);
    }
  }, [auth.isAuthenticated, next, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    await auth.signIn();
  };

  const handlePuterGoogleSignIn = async () => {
    clearError();
    await auth.signIn();
  };

  const isSignUp = mode === "signup";

  const authCtaMobile =
    "max-sm:!min-h-12 max-sm:!py-3 max-sm:!inline-flex max-sm:!items-center max-sm:!justify-center";

  return (
    <main className="relative min-h-[calc(100svh-4.5rem)] w-full overflow-x-hidden !min-h-0 sm:flex sm:items-center sm:justify-center sm:py-12">
      {/*
        Mobile: match home section inset — px-6 pt-20 pb-12 (home uses main pt-10 globally + section pt-20).
        sm+: restore framed card and vertical centering.
      */}
      <div className="mx-auto w-full max-w-md px-6 pb-12 pt-20 sm:max-w-xl sm:px-8 sm:pb-0 sm:pt-0">
        <div className="w-full border-0 bg-transparent p-0 shadow-none max-sm:backdrop-blur-none sm:rounded-3xl sm:border sm:border-gray-100/80 sm:bg-white/95 sm:p-8 sm:shadow-sm sm:backdrop-blur">
          <div className="mb-10 flex flex-col items-center gap-2 text-center max-sm:items-start max-sm:text-left">
            <h1 className="max-w-xl text-balance">
              {isSignUp ? "Create your free account" : "Welcome back"}
            </h1>
            <h2 className="max-w-xl text-balance">
              {isSignUp
                ? "Sharpen your CV with clear, AI-backed feedback."
                : "Get honest feedback and fix what holds your CV back."}
            </h2>

            {isSignUp ? (
              <div className="mt-3 w-full max-w-xl overflow-hidden rounded-md border border-yellow-500/90 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.06)] max-sm:mx-0 sm:mx-auto">
                <div className="border-b border-yellow-600/25 bg-yellow-400 px-4 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-900">
                    Why you need an account
                  </p>
                </div>
                <div className="bg-white px-4 py-3">
                  <p className="text-xs leading-relaxed text-neutral-800">
                    A{" "}
                    <a
                      href="https://puter.com"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-neutral-900 underline decoration-current underline-offset-[3px] transition hover:opacity-90"
                    >
                      Puter
                    </a>{" "}
                    account is necessary to run Free AI reviews in the cloud
                    through Puter&apos;s hosted AI APIs, so you are not billed by
                    this app for server infrastructure.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-full flex-col gap-0 text-sm max-sm:items-stretch"
          >
            {/* Tighter spacing between label+input groups */}
            <div className="flex w-full max-w-full min-w-0 flex-col gap-4">
              {isSignUp && (
                <div className="form-div !gap-2 max-sm:w-full">
                  <label htmlFor="auth-name" className={authLabelClass}>
                    Full name
                  </label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className={authInputClass}
                  />
                </div>
              )}

              <div className="form-div !gap-2 max-sm:w-full">
                <label htmlFor="auth-email" className={authLabelClass}>
                  Email
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={authInputClass}
                />
              </div>

              <div className="form-div !gap-2 max-sm:w-full">
                <label htmlFor="auth-password" className={authLabelClass}>
                  Password
                </label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className={authInputClass}
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="mt-10 flex w-full flex-col gap-5">
                <button
                  type="button"
                  onClick={handlePuterGoogleSignIn}
                  disabled={isLoading}
                  className={`google-oauth-button ${authCtaMobile} sm:!min-h-12 sm:!py-3 disabled:opacity-60`}
                >
                  <img
                    src="/images/google.png"
                    alt=""
                    aria-hidden
                    className="h-5 w-5 shrink-0"
                  />
                  {isLoading ? "Opening Puter…" : "Sign in with Google"}
                </button>

                <div className="relative w-full">
                  <span className="block h-px w-full bg-gray-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 px-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    or
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`primary-button ${authCtaMobile} text-sm disabled:opacity-60 sm:!min-h-12 sm:!py-3`}
                >
                  {isLoading ? "Opening Puter…" : "Sign in"}
                </button>

                <div className="flex flex-col gap-3 pt-5">
                  <p
                    className={`text-xs leading-relaxed text-neutral-600 ${authHelperIndent} max-sm:text-left sm:text-center`}
                  >
                    Create an account by clicking the button below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`signin-button ${authCtaMobile} sm:!min-h-12 sm:!py-3 !border-black !bg-black hover:!border-neutral-900 hover:!bg-neutral-900`}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-8 text-sm text-badge-red-text bg-badge-red rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {isSignUp && (
              <div className="mt-10 flex w-full flex-col gap-5">
                <button
                  type="button"
                  onClick={handlePuterGoogleSignIn}
                  disabled={isLoading}
                  className={`google-oauth-button ${authCtaMobile} sm:!min-h-12 sm:!py-3 disabled:opacity-60`}
                >
                  <img
                    src="/images/google.png"
                    alt=""
                    aria-hidden
                    className="h-5 w-5 shrink-0"
                  />
                  {isLoading ? "Opening Puter…" : "Sign in with Google"}
                </button>

                <div className="relative w-full">
                  <span className="block h-px w-full bg-gray-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 px-3 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    or
                  </span>
                </div>

                <div className="flex w-full flex-col gap-3">
                  <p
                    className={`text-xs leading-relaxed text-neutral-600 ${authHelperIndent} max-sm:text-left sm:text-center`}
                  >
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="inline font-normal text-inherit"
                      onClick={() => setMode("signin")}
                    >
                      Sign in{" "}
                      <span className="underline underline-offset-2 decoration-current">
                        here
                      </span>
                    </button>
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`primary-button ${authCtaMobile} text-sm disabled:opacity-60 sm:!min-h-12 sm:!py-3`}
                  >
                    {isLoading ? "Opening Puter…" : "Create account"}
                  </button>
                </div>
              </div>
            )}

            <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
              Authentication is securely handled by{" "}
              <a
                href="https://puter.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Puter
              </a>
              . Submitting will open Puter&apos;s sign-in window.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Auth;
