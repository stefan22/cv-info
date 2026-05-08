import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Cake®Stack | Sign in" },
  { name: "description", content: "Sign in or create an account" },
];

type AuthMode = "signin" | "signup";

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

  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

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

  return (
    <main className="relative flex h-[calc(100svh-4.5rem)] max-h-[calc(100svh-4.5rem)] w-full !min-h-0 !pt-0 min-h-0 items-center justify-center overflow-hidden px-3 py-2">
      <div className="flex w-full max-w-md max-h-full min-h-0 flex-col justify-center">
        <div className="max-h-full min-h-0 overflow-y-auto rounded-3xl border border-gray-100/80 bg-white/95 p-5 shadow-sm backdrop-blur sm:p-7">
          <div className="mb-5 flex flex-col items-center gap-1 text-center">
            <h1 className="!text-lg sm:!text-xl leading-snug">
              {isSignUp ? "Create your free account" : "Welcome back"}
            </h1>
            <h2 className="!text-[11px] sm:!text-xs leading-relaxed px-1 max-w-sm">
              {isSignUp
                ? "Sharpen your CV with clear, AI-backed feedback."
                : "Get honest feedback and fix what holds your CV back."}
            </h2>

            {isSignUp ? (
              <div className="mt-3 w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-dark-200 mb-1">
                  Why you need an account
                </p>
                <p className="text-[0.65rem] text-dark-200 leading-snug sm:text-xs sm:leading-relaxed">
                  A{" "}
                  <a
                    href="https://puter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-medium"
                  >
                    Puter
                  </a>{" "}
                  account is necessary to run Free AI reviews in the cloud
                  through Puter&apos;s hosted AI APIs, so you are not billed by
                  this app for server infrastructure.
                </p>
              </div>
            ) : null}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-gray-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-full py-1.5 transition ${
                mode === "signin"
                  ? "bg-white text-dark-200 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full py-1.5 transition ${
                mode === "signup"
                  ? "bg-white text-dark-200 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="!gap-4 text-sm">
            {isSignUp && (
              <div className="form-div !gap-1.5">
                <label htmlFor="auth-name" className="text-sm">
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
                  className="!p-2.5 !text-sm !rounded-xl border border-transparent focus:!border-indigo-200 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-indigo-100"
                />
              </div>
            )}

            <div className="form-div !gap-1.5">
              <label htmlFor="auth-email" className="text-sm">
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
                className="!p-2.5 !text-sm !rounded-xl border border-transparent focus:!border-indigo-200 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-indigo-100"
              />
            </div>

            <div className="form-div !gap-1.5">
              <label htmlFor="auth-password" className="text-sm">
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
                className="!p-2.5 !text-sm !rounded-xl border border-transparent focus:!border-indigo-200 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-indigo-100"
              />
            </div>

            {!isSignUp && (
              <>
                <button
                  type="button"
                  onClick={handlePuterGoogleSignIn}
                  disabled={isLoading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-dark-200 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <img
                    src="/images/google.png"
                    alt=""
                    aria-hidden
                    className="h-3.5 w-3.5"
                  />
                  {isLoading ? "Opening Puter…" : "Sign in with Google"}
                </button>

                <div className="relative my-1 w-full">
                  <span className="block h-px w-full bg-gray-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[11px] uppercase tracking-wide text-gray-400">
                    or
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="primary-button mt-2 !py-2 text-sm disabled:opacity-60"
                >
                  {isLoading ? "Opening Puter…" : "Sign in"}
                </button>
              </>
            )}

            {error && (
              <p className="text-sm text-badge-red-text bg-badge-red rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {isSignUp && (
              <button
                type="submit"
                disabled={isLoading}
                className="primary-button mt-4 !py-2 text-sm disabled:opacity-60"
              >
                {isLoading ? "Opening Puter…" : "Create account"}
              </button>
            )}

            <p className="mt-1 text-center text-[0.65rem] leading-snug text-gray-500 sm:text-xs">
              Authentication is securely handled by{" "}
              <a
                href="https://puter.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Puter
              </a>
              . Submitting will open Puter's sign-in window.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Auth;
